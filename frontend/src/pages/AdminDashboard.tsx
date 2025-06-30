import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Filter, Eye, Edit, FileText, Calendar, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { authenticatedFetch } from '../lib/utils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    setIsAuthenticated(true);
    loadReports();
  }, [navigate]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, typeFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/api/admin/reports', { method: 'GET' });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
        return;
      }
      const data = await res.json();
      if (data.success) {
        // Map each report to ensure it has an 'id' field and flatten location
        const mappedReports = data.reports.map((r: any) => ({
          ...r,
          id: r.id || r.reportId || r._id,
          location: r.location?.address || r.location
        }));
        setReports(mappedReports);
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to load reports' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load reports' });
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(report => report.crimeType === typeFilter);
    }

    setFilteredReports(filtered);
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
        return;
      }
      const data = await res.json();
      if (data.success) {
        loadReports();
        toast({
          title: 'Status Updated',
          description: `Report ${reportId} status changed to ${newStatus}`,
        });
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to update status' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update status' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Review':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStats = () => {
    const total = reports.length;
    const submitted = reports.filter(r => r.status === 'Submitted').length;
    const inReview = reports.filter(r => r.status === 'In Review').length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;
    
    return { total, submitted, inReview, resolved };
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const stats = getStats();
  const crimeTypes = [...new Set(reports.map(r => r.crimeType))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <Badge variant="outline">SecureSignal</Badge>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.submitted}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Review</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.inReview}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search reports by ID, title, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {crimeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Crime Reports ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-sm">{report.id}</TableCell>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{report.crimeType}</TableCell>
                      <TableCell className="text-sm text-gray-600">{report.location}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(report.submittedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Report Details - {selectedReport?.id}</DialogTitle>
                              </DialogHeader>
                              {selectedReport && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Status</label>
                                      <div className="mt-1">
                                        <Badge className={getStatusColor(selectedReport.status)}>
                                          {selectedReport.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Crime Type</label>
                                      <p className="mt-1">{selectedReport.crimeType}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Title</label>
                                    <p className="mt-1 font-medium">{selectedReport.title}</p>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Location</label>
                                    <p className="mt-1">{selectedReport.location}</p>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Description</label>
                                    <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">{selectedReport.description}</p>
                                  </div>
                                  
                                  {selectedReport.aiSummary && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">AI Summary</label>
                                      <p className="mt-1 text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">{selectedReport.aiSummary}</p>
                                    </div>
                                  )}
                                  
                                  <div className="pt-4 border-t">
                                    <label className="text-sm font-medium text-gray-600">Update Status</label>
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        size="sm"
                                        variant={selectedReport.status === 'In Review' ? 'default' : 'outline'}
                                        onClick={() => handleStatusUpdate(selectedReport.id, 'In Review')}
                                      >
                                        In Review
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={selectedReport.status === 'Resolved' ? 'default' : 'outline'}
                                        onClick={() => handleStatusUpdate(selectedReport.id, 'Resolved')}
                                      >
                                        Resolved
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No Reports Found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
