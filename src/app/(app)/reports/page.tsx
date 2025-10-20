'use client';

import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download } from 'lucide-react';

const reports = [
    'Attendance Report', 
    'Revenue Report', 
    'Compliance Report', 
    'Client Demographics', 
    'Transportation Report', 
    'Staff Performance'
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" breadcrumbs={[{ name: 'Reports' }]} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => (
            <Card key={report}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold">{report}</CardTitle>
                    <BarChart3 className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Generate a comprehensive report.</p>
                    <Button variant="link" className="p-0 text-sm text-primary font-medium flex items-center gap-2">
                        Generate Report
                        <Download className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
