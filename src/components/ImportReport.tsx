import React from "react";
import type { ImportReport } from "@/utils/partner-validate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Plus } from "lucide-react";

export function ImportReportView({ report, onAppend }: {
  report: ImportReport;
  onAppend: () => void;
}) {
  const { counts, missingHeaders, extraHeaders } = report;

  function downloadFixed() {
    const blob = new Blob([report.fixedCsv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aesthetiq-fixed.csv";
    a.click();
  }

  return (
    <div className="mt-4 space-y-3">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm mb-3">
            <span className="font-medium">Summary:</span>{" "}
            <Badge variant="default" className="ml-2 bg-green-500">Pass {counts.pass}</Badge>{" "}
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warn {counts.warn}</Badge>{" "}
            <Badge variant="destructive">Fail {counts.fail}</Badge>{" "}
            <span className="text-muted-foreground">/ {counts.total} rows</span>
          </div>
          {!report.headersOk && (
            <div className="mt-2 text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive">
              Missing headers: {missingHeaders.join(", ") || "none"}
              {report.extraHeaders.length > 0 && <div>Extra headers: {extraHeaders.join(", ")}</div>}
            </div>
          )}
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <Button onClick={downloadFixed} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download fixed CSV
            </Button>
            <Button
              size="sm"
              disabled={counts.pass + counts.warn === 0}
              onClick={onAppend}>
              <Plus className="w-4 h-4 mr-2" />
              Append to catalog (Pass + Warn)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="w-24">Price</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Palette</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.map(r => (
                  <TableRow key={r.index}>
                    <TableCell className="text-muted-foreground">{r.index}</TableCell>
                    <TableCell>
                      {r.status === "PASS" && <Badge variant="default" className="bg-green-500">PASS</Badge>}
                      {r.status === "WARN" && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">WARN</Badge>}
                      {r.status === "FAIL" && <Badge variant="destructive">FAIL</Badge>}
                    </TableCell>
                    <TableCell className="font-medium">{r.original.title}</TableCell>
                    <TableCell>{r.original.brand}</TableCell>
                    <TableCell>{r.original.price}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">{r.original.tags}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.original.palette?.split(/[;,\s]+/).slice(0, 3).map((hex, i) => (
                          <div key={i} className="w-4 h-4 rounded border" style={{ background: hex }} title={hex} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[300px]">
                      {r.errors.length > 0 && <div className="text-destructive mb-1">Errors: {r.errors.join("; ")}</div>}
                      {r.warnings.length > 0 && <div className="text-yellow-700">Warnings: {r.warnings.join("; ")}</div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
