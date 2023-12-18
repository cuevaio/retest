"use client";

import Cookies from "js-cookie";
import * as React from "react";

export function getVariantClient(experiment: string) {
  let [variant, setVariant] = React.useState<string | undefined>(undefined);
  let [startedAt, setStartedAt] = React.useState<string | undefined>(undefined);
  let [endedAt, setEndedAt] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let cookies = Cookies.get();

    const cookieKey = Object.keys(cookies).find(
      (key) => cookies[key] === experiment,
    );

    let index = cookieKey ? parseInt(cookieKey.split("-")[1] || "") : undefined;

    let _variant: string | undefined = index
      ? cookies[`rt-${index}-var`]
      : undefined;

    let _startedAt = index ? cookies[`rt-${index}-sta`] : undefined;
    let _endedAt = index ? cookies[`rt-${index}-end`] : undefined;

    if (_startedAt && _endedAt) {
      let now = new Date().toISOString();
      if (now < _startedAt || now > _endedAt) {
        variant = undefined;
      }
    }

    setVariant(_variant);
    setStartedAt(_startedAt);
    setEndedAt(_endedAt);
  }, [experiment]);

  return { variant, startedAt, endedAt };
}
