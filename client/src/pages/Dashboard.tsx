import { useEffect, useState } from "react";
import { fetchConversionsData, calculateMetrics, ConversionRecord, DepartmentMetrics } from "@/lib/googleSheets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";
import { 
  Activity, Users, TrendingUp, RefreshCw, Settings, ArrowUpRight, Filter, Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-white/10 text-white">
        <p className="font-mono text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [records, setRecords] = useState<ConversionRecord[]>([]);
  const [metrics, setMetrics] = useState<DepartmentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetId, setSheetId] = useState("2PACX-1vQKmS5vEjBt1V7Q1ba9x5nGw9wY0YmgP-rmi7zgx3PfeSiZTJP4Xa-Bf6Cj4xi6Yu6eGllOJAbrBpkI");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Load data
  const loadData = async () => {
    setLoading(true);
    const result = await fetchConversionsData(sheetId);
    setRecords(result);
    const calculatedMetrics = calculateMetrics(result);
    setMetrics(calculatedMetrics);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [sheetId]);

  // Prepare employee data for chart
  const employeeChartData = metrics.flatMap(dept => 
    dept.employees.map(emp => ({
      name: emp.name,
      conversions: emp.count,
      department: dept.name
    }))
  );

  // Get department totals
  const personalInjury = metrics.find(m => m.name === 'Personal Injury');
  const habitability = metrics.find(m => m.name === 'Habitability');

  const DEPT_COLORS = {
    'Personal Injury': '#dc2626',
    'Habitability': '#2563eb'
  };

  return (
    <div className="min-h-screen w-full bg-[url('/images/glassmorphic-bg-1.jpg')] bg-cover bg-center bg-fixed text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Overlay to ensure readability */}
      <div className="fixed inset-0 bg-background/60 backdrop-blur-[2px] z-0 pointer-events-none" />
      
      <div className="relative z-10 container py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white neon-text">
              Conversion<span className="text-primary">OS</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-light">
              Live HubSpot & Coefficient Data Stream
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE UPDATES ON
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-primary">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Data Source Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sheetId">Google Sheet ID</Label>
                    <Input 
                      id="sheetId" 
                      placeholder="2PACX-1vQKmS5vEjBt1V7Q1ba9x5nGw9wY0YmgP-rmi7zgx3PfeSiZTJP4Xa-Bf6Cj4xi6Yu6eGllOJAbrBpkI" 
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      className="bg-black/20 border-white/10 text-white"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use the Sheet ID from your published Google Sheet URL (the part after /d/e/)
                    </p>
                  </div>
                  <Button onClick={loadData} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Connect & Refresh
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={loadData} 
              variant="outline" 
              className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-primary gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        {/* Department KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard 
            title="Personal Injury" 
            value={personalInjury?.totalConversions || 0}
            icon={<Activity className="h-5 w-5 text-red-400" />}
            color="text-red-400"
            bgColor="bg-red-500/10"
          />
          <MetricCard 
            title="Habitability" 
            value={habitability?.totalConversions || 0}
            icon={<Activity className="h-5 w-5 text-blue-400" />}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          />
        </div>

        {/* Employee Conversion Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Injury Employees */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-red-400" />
                Personal Injury Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {personalInjury?.employees.map((emp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-white font-medium">{emp.name}</span>
                  <span className="text-2xl font-bold font-mono text-red-400">{emp.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Habitability Employees */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Habitability Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {habitability?.employees.map((emp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-white font-medium">{emp.name}</span>
                  <span className="text-2xl font-bold font-mono text-blue-400">{emp.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Employee Comparison Chart */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Conversions by Employee
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="conversions" fill="var(--primary)" radius={[8, 8, 0, 0]}>
                  {employeeChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.department === 'Personal Injury' ? '#dc2626' : '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Conversions Table */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Recent Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client Name</th>
                    <th className="px-4 py-3 font-medium">Lead Status</th>
                    <th className="px-4 py-3 font-medium">Contact Owner</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records
                    .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime())
                    .slice(0, 15)
                    .map((record, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{record.firstName} {record.lastName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{record.leadStatus}</td>
                      <td className="px-4 py-3 text-primary">{record.contactOwnerFirstName} {record.contactOwnerLastName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.dept === 'Personal Injury' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {record.dept}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{record.createDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <footer className="text-center text-xs text-muted-foreground pt-8 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-3 w-3" />
            <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <p className="opacity-50">Designed by Manus AI • Powered by Coefficient</p>
        </footer>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, bgColor }: any) {
  return (
    <Card className={`glass-card border-0 relative overflow-hidden group hover:bg-white/10 transition-all duration-300 ${bgColor}`}>
      <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('text-', 'bg-')}`} />
      <CardContent className="p-8 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            {icon}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <h3 className={`text-5xl font-bold font-mono ${color} neon-text`}>{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
