"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@retestlabs/ui/avatar"
import { Button } from "@retestlabs/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@retestlabs/ui/dropdown-menu"

import { SignIn, SignOut } from "./auth-buttons"
import Link from "next/link";
import { useUser } from "@/hooks/use-user";

export function UserButton() {
  let { isLoading, user } = useUser();

  if (!isLoading && !user) return <SignIn />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-8 h-8 rounded-full">
          <Avatar className="w-8 h-8">
            {user?.image && (
              <AvatarImage
                src={user?.image}
                alt={user?.name ?? ""}
              />
            )}
            <AvatarFallback>{user?.email?.[0]?.toLocaleUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Button variant="ghost" className="w-full justify-start p-2 h-min" asChild>
            <Link href="/app/settings">
              Account settings
            </Link>
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
