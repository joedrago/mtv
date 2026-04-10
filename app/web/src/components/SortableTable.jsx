import { useMemo, useState } from "react"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableSortLabel from "@mui/material/TableSortLabel"

// Generic sortable table.
//
// columns: [{ key, label, sortWith?, sortValue?, render?, align?, width?, cellSx? }]
//   - sortWith: key of another column used as a tie-breaker (always ascending)
//   - sortValue: (row) => primitive used for sorting, defaults to row[key]
//   - render: (row) => ReactNode for the cell, defaults to row[key]
// rows: array of row objects
// rowKey: (row) => stable key
// onRowClick: optional (row) => void
//
// Click a header to cycle: none → asc → desc → none.

const compareValues = (a, b) => {
    if (a == null && b == null) return 0
    if (a == null) return 1
    if (b == null) return -1
    if (typeof a === "number" && typeof b === "number") return a - b
    return String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true })
}

const getSortValue = (col, row) => (col.sortValue ? col.sortValue(row) : row[col.key])

export const SortableTable = ({ columns, rows, rowKey, onRowClick, initialSort = null, size = "small" }) => {
    const [sort, setSort] = useState(initialSort) // null | { key, direction }

    const cycleSort = (key) => {
        setSort((prev) => {
            if (!prev || prev.key !== key) return { key, direction: "asc" }
            if (prev.direction === "asc") return { key, direction: "desc" }
            return null
        })
    }

    const sortedRows = useMemo(() => {
        if (!sort) return rows
        const primary = columns.find((c) => c.key === sort.key)
        if (!primary) return rows
        const secondary = primary.sortWith ? columns.find((c) => c.key === primary.sortWith) : null
        const dir = sort.direction === "asc" ? 1 : -1
        return rows.slice().sort((a, b) => {
            const pcmp = compareValues(getSortValue(primary, a), getSortValue(primary, b)) * dir
            if (pcmp !== 0) return pcmp
            if (!secondary) return 0
            return compareValues(getSortValue(secondary, a), getSortValue(secondary, b))
        })
    }, [rows, sort, columns])

    return (
        <Table size={size}>
            <TableHead>
                <TableRow>
                    {columns.map((col) => {
                        const active = sort?.key === col.key
                        return (
                            <TableCell
                                key={col.key}
                                align={col.align ?? "left"}
                                sortDirection={active ? sort.direction : false}
                                sx={{
                                    width: col.width,
                                    py: 1,
                                    color: "text.secondary",
                                    fontSize: "0.7rem",
                                    fontWeight: 500,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    borderBottom: 1,
                                    borderColor: "divider",
                                    userSelect: "none"
                                }}
                            >
                                <TableSortLabel
                                    active={active}
                                    direction={active ? sort.direction : "asc"}
                                    onClick={() => cycleSort(col.key)}
                                    sx={{
                                        "&.Mui-active": { color: "text.primary" },
                                        "& .MuiTableSortLabel-icon": { opacity: active ? 0.8 : 0 }
                                    }}
                                >
                                    {col.label}
                                </TableSortLabel>
                            </TableCell>
                        )
                    })}
                </TableRow>
            </TableHead>
            <TableBody>
                {sortedRows.map((r, i) => (
                    <TableRow
                        key={rowKey ? rowKey(r) : i}
                        hover={!!onRowClick}
                        onClick={onRowClick ? () => onRowClick(r) : undefined}
                        sx={{
                            cursor: onRowClick ? "pointer" : "default",
                            "& td": { borderBottom: 1, borderColor: "divider", py: 0.5 }
                        }}
                    >
                        {columns.map((col) => (
                            <TableCell key={col.key} align={col.align ?? "left"} sx={col.cellSx}>
                                {col.render ? col.render(r) : r[col.key]}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
