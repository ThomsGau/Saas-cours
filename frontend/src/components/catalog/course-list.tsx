import Link from "next/link";
import { BookOpenIcon } from "lucide-react";

import { CourseCard } from "@/components/catalog/course-card";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import type { CatalogCourse } from "@/lib/catalog/catalog-data";

type CourseListProps = {
  courses: CatalogCourse[];
  isSubscribed: boolean;
  onSubscribeRequest: () => void;
};

export function CourseList({
  courses,
  isSubscribed,
  onSubscribeRequest,
}: CourseListProps) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpenIcon}
        title="Aucun cours trouvé"
        description="Essayez de modifier vos filtres ou votre recherche."
        action={
          <Button variant="outline" render={<Link href="/" />}>
            Retour à l&apos;accueil
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isSubscribed={isSubscribed}
          onSubscribeRequest={onSubscribeRequest}
        />
      ))}
    </div>
  );
}
