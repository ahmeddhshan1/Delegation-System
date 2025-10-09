import {
    flexRender,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useLocation, useNavigate, useParams } from "react-router"


function DataTable({ table, columns, clickableRow = false }) {
    const navigate = useNavigate()
    const route = useLocation()
    
    return (
        <div className="w-full" dir="rtl">
            <div className="rounded-md border">
                <Table className="w-full table-auto">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-12 break-words py-3 px-3 bg-gray-100 border-b border-gray-200">
                                            <div className="break-words whitespace-normal text-sm font-medium text-gray-800">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </div>
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={clickableRow && "cursor-pointer"}
                                    onClick={(e) => {
                                        if(clickableRow) {
                                            if (e.target.closest("button") || 
                                                e.target.closest("[role='menuitem']") || 
                                                e.target.closest("[data-slot='dialog-overlay']") ||
                                                e.target.closest("input") ||
                                                e.target.closest("select") ||
                                                e.target.closest("textarea") ||
                                                e.target.closest("[role='dialog']") ||
                                                e.target.closest(".dialog-content")) return;
                                            navigate(`${route.pathname}/${row.original.id}`);
                                        } else return
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="h-auto align-top break-words">
                                            <div className="break-words whitespace-normal">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    لا يوجد نتائج.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} من {table.getFilteredRowModel().rows.length} صفوف مختارة.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        السابق
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        التالي
                    </Button>
                </div>
            </div>
        </div>
    )
}


export default DataTable