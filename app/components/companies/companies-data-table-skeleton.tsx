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

const SKELETON_ROWS = 8
const SKELETON_COLUMNS = 7

export function CompaniesDataTableSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Skeleton className="h-8 w-full max-w-sm" />
        <Skeleton className="h-8 w-full sm:w-32" />
      </div>

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
                      <Skeleton className="h-4 w-full max-w-28" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScrollArea>
      </div>

      <Skeleton className="h-4 w-48" />
    </div>
  )
}
