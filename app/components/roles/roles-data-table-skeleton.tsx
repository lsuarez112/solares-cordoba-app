import { Skeleton } from "~/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { TableScrollArea } from "~/components/ui/table-scroll-area"

const SKELETON_ROWS = 6
const SKELETON_COLUMNS = 7

export function RolesDataTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 max-w-sm w-full" />

      <div className="min-w-0 overflow-hidden rounded-lg border bg-card">
        <TableScrollArea>
          <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: SKELETON_COLUMNS }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: SKELETON_COLUMNS }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton
                      className={
                        colIndex === SKELETON_COLUMNS - 1
                          ? "size-7"
                          : "h-4 w-full max-w-28"
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableScrollArea>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  )
}
