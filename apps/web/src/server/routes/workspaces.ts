import { z } from "zod";

import { protectedProcedure } from "../trpc";

import { WorkspacesRecord, getXataClient } from "@/lib/xata";
import { getResendClient } from "@/lib/resend";
import { TRPCError } from "@trpc/server";

let xata = getXataClient();
let resend = getResendClient();

export const workspacesRoutes = {
  listWorkspaces: protectedProcedure.query(async (opts) => {
    const {
      ctx: { user },
    } = opts;

    let rels = await xata.db.workspace_user_relations
      .select(["workspace.*"])
      .filter({
        user: user.id,
      })
      .getAll();

    let workspaces: WorkspacesRecord[] = [];

    rels.forEach((r) => {
      if (r.workspace) {
        workspaces.push(r.workspace);
      }
    });

    return workspaces;
  }),

  getWorkspace: protectedProcedure
    .input(z.object({ workspaceHandle: z.string() }))
    .query(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;
      let rel = await xata.db.workspace_user_relations
        .select(["workspace.*"])
        .filter({
          user: user.id,
          workspace: {
            handle: input.workspaceHandle,
          },
        })
        .getFirst();
      if (!rel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }
      return rel.workspace as Readonly<WorkspacesRecord>;
    }),

  listWorspaceUsers: protectedProcedure
    .input(z.object({ workspaceHandle: z.string() }))
    .query(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;
      let rel = await xata.db.workspace_user_relations
        .select(["workspace.id"])
        .filter({
          user: user.id,
          workspace: {
            handle: input.workspaceHandle,
          },
        })
        .getFirst();
      if (!rel?.workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      let w_u = await xata.db.workspace_user_relations
        .select(["user.name", "user.email", "user.image", "isOwner"])
        .filter({
          workspace: rel.workspace.id,
        })
        .getAll();

      let users: {
        name: string | undefined | null;
        email: string;
        image: string | undefined | null;
        role: "owner" | "mantainer";
      }[] = [];

      w_u.forEach((r) => {
        if (r.user && r.user.email) {
          users.push({
            name: r.user.name,
            email: r.user.email,
            image: r.user.image,
            role: r.isOwner ? "owner" : "mantainer",
          });
        }
      });

      return users;
    }),

  listWorkspaceInvites: protectedProcedure
    .input(z.object({ workspaceHandle: z.string() }))
    .query(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;
      let rel = await xata.db.workspace_user_relations
        .select(["workspace.id"])
        .filter({
          user: user.id,
          workspace: {
            handle: input.workspaceHandle,
          },
        })
        .getFirst();
      if (!rel?.workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      let invites = await xata.db.workspace_invites
        .select([
          "id",
          "email",
          "xata.createdAt",
          "owner.name",
          "owner.email",
          "owner.image",
        ])
        .filter({
          workspace: rel.workspace.id,
        })
        .getAll();

      return invites;
    }),

  inviteUserToWorkspace: protectedProcedure
    .input(z.object({ workspaceHandle: z.string(), email: z.string().email() }))
    .mutation(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;
      let rel = await xata.db.workspace_user_relations
        .select([
          "workspace.id",
          "workspace.name",
          "workspace.handle",
          "isOwner",
        ])
        .filter({
          user: user.id,
          workspace: {
            handle: input.workspaceHandle,
          },
        })
        .getFirst();
      if (!rel?.workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (!rel.isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can invite users",
        });
      }

      let existing_rel = await xata.db.workspace_user_relations
        .filter({
          "user.email": input.email,
          workspace: rel.workspace.id,
        })
        .getFirst();

      if (existing_rel) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already in workspace",
        });
      }

      const { error } = await resend.emails.send({
        from: "Retest (dev mode) <onboarding@updates.fitpeak.shop>",
        to: [input.email],
        subject: `Join ${rel.workspace.name} in Retest!`,
        html: `
          <p>Hello friend,</p>
          <p>${user.name} (${user.email}) has invited you to join their workspace '${rel.workspace.name}' in Retest.</p>
          <p>Click the link below to accept the invitation.</p>
          <a href="http://localhost:3000/accept-invite?team=${rel.workspace.handle}">Accept invite</a>
        `,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      let existing_invite = await xata.db.workspace_invites
        .filter({
          workspace: rel.workspace.id,
          email: input.email,
          owner: user.id,
        })
        .getFirst();

      if (existing_invite) {
        return existing_invite.update({
          emailsSentCount: {
            $increment: 1,
          },
        });
      } else {
        let invite = await xata.db.workspace_invites.create({
          workspace: rel.workspace.id,
          owner: user.id,
          email: input.email,
          emailsSentCount: 1,
        });

        return invite;
      }
    }),

  listUserWorkspaceInvites: protectedProcedure.query(async (opts) => {
    const {
      ctx: { user },
    } = opts;
    let invites = await xata.db.workspace_invites
      .select([
        "xata.updatedAt",

        "workspace.handle",
        "workspace.name",
        "workspace.image.url",

        "owner.email",
        "owner.name",
        "owner.image",
      ])
      .filter({
        email: user.email,
      })
      .sort("xata.updatedAt", "desc")
      .getAll();

    return invites;
  }),

  acceptWorkspaceInvite: protectedProcedure
    .input(z.object({ workspaceHandle: z.string() }))
    .mutation(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;

      let invite = await xata.db.workspace_invites
        .select(["workspace.id", "workspace.name"])
        .filter({
          email: user.email,
          workspace: {
            handle: input.workspaceHandle,
          },
        })
        .getFirst();

      if (!invite?.workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      let existing_rel = await xata.db.workspace_user_relations
        .filter({
          user: user.id,
          workspace: invite.workspace.id,
        })
        .getFirst();

      if (existing_rel) {
        return existing_rel;
      }

      let rel = await xata.db.workspace_user_relations.create({
        user: user.id,
        workspace: invite.workspace.id,
        isOwner: false,
      });

      await xata.db.workspace_invites.delete({
        id: invite.id,
      });
      return rel;
    }),

  rejectWorkspaceInvite: protectedProcedure
    .input(z.object({ workspaceHandle: z.string() }))
    .mutation(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;

      let invite = await xata.db.workspace_invites
        .select(["workspace.id", "workspace.name"])
        .filter({
          email: user.email,
          workspace: {
            handle: input.workspaceHandle,
          },
        })
        .getFirst();

      if (!invite?.workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      await xata.db.workspace_invites.delete({
        id: invite.id,
      });

      return true;
    }),
};
