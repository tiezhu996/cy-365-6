import { Chip, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import type { OperationRecord } from "../types";

interface OperationsTableProps {
  records: OperationRecord[];
}

export function OperationsTable({ records }: OperationsTableProps) {
  return (
    <Table size="small" aria-label="运营任务">
      <TableHead>
        <TableRow>
          <TableCell>模块</TableCell>
          <TableCell>负责人</TableCell>
          <TableCell>状态</TableCell>
          <TableCell>指标</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.key}>
            <TableCell>{record.name}</TableCell>
            <TableCell>{record.owner}</TableCell>
            <TableCell><Chip size="small" label={record.status} /></TableCell>
            <TableCell>{record.metric}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
