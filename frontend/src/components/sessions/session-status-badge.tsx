import { Badge } from "@/components/ui/badge";
import {
  getSessionStatusLabel,
  getSessionStatusVariant,
} from "@/lib/format/session-status";
import type { PrivateSession } from "@/lib/api/types";

type SessionStatusBadgeProps = {
  status: PrivateSession["status"];
};

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  return (
    <Badge variant={getSessionStatusVariant(status)}>
      {getSessionStatusLabel(status)}
    </Badge>
  );
}
