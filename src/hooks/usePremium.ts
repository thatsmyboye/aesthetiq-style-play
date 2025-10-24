import { useEffect, useState } from "react";
import { loadEntitlement } from "@/state/premium";

export function usePremium() {
  const [active, setActive] = useState(loadEntitlement().active);
  useEffect(()=>{
    const i = setInterval(()=> setActive(loadEntitlement().active), 1000);
    return ()=> clearInterval(i);
  }, []);
  return { premium: active };
}
