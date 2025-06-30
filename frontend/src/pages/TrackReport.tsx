import { useState, useEffect } from 'react';
import { Search, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'react-router-dom';

const TrackReport = () => {
  const { reportId: paramReportId } = useParams();
  const location = useLocation();
  const { reportId: initialReportId } = location.state || {};
  
  const [reportId, setReportId] = useState(paramReportId || initialReportId || '');
  const [reportData, setReportData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paramReportId || initialReportId) {
      handleTrackReport(paramReportId || initialReportId);
    }
    // eslint-disable-next-line
  }, [paramReportId, initialReportId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <Clock className="w-4 h-4" />;
      case 'In Review':
        return <AlertCircle className="w-4 h-4" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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

  const handleTrackReport = async (idOverride?: string) => {
    const idToSearch = idOverride || reportId;
    if (!idToSearch.trim()) {
      toast({
        title: "Missing Report ID",
        description: "Please enter a valid report ID.",
        variant: "destructive",
      });
      return;
    }
    setIsSearching(true);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reports/${idToSearch}`);
      const data = await res.json();
      if (res.ok && data.success && typeof data.report === 'object' && data.report !== null) {
        setReportData({
          ...data.report,
          id: data.report.id || data.report.reportId,
          title: data.report.title,
          status: data.report.status,
          submittedAt: data.report.submittedAt,
          submittedDate: data.report.submittedAt,
          crimeType: data.report.crimeType,
          location: data.report.location?.address || data.report.location,
          description: data.report.description,
          aiSummary: data.report.aiSummary,
          dateTime: data.report.dateTime,
        });
        toast({
          title: "Report Found",
          description: "Your report details have been loaded.",
        });
      } else {
        setReportData(null);
        toast({
          title: "Report Not Found",
          description: data.message || "Please check your Report ID and try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setReportData(null);
      toast({
        title: "Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Report</h1>
            <p className="text-gray-600">
              Enter your Report ID to check the status and details of your submission
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={reportId}
                    onChange={(e) => setReportId(e.target.value)}
                    placeholder="Enter your Report ID (e.g., SR-ABC123XYZ)"
                    className="text-lg"
                  />
                </div>
                <Button
                  onClick={() => handleTrackReport()}
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? 'Searching...' : 'Track Report'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading && (
            <div className="text-center text-gray-500 py-8">Loading report details...</div>
          )}

          {reportData && !loading && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Report Status</span>
                    <Badge className={`${getStatusColor(reportData.status)} flex items-center gap-1`}>
                      {getStatusIcon(reportData.status)}
                      {reportData.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Report ID</label>
                      <p className="text-lg font-mono">{reportData.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Submitted Date</label>
                      <p>{formatDate(reportData.submittedDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Title</label>
                    <p className="text-lg">{reportData.title}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Crime Type</label>
                      <p>{reportData.crimeType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p>{reportData.location}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{reportData.description}</p>
                  </div>

                  {reportData.dateTime && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Incident Date & Time</label>
                      <p>{formatDate(reportData.dateTime)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Summary */}
              {reportData.aiSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      AI-Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                      <p className="text-gray-700">{reportData.aiSummary}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!reportData && !isSearching && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Report Selected</h3>
                <p className="text-gray-500">Enter your Report ID above to view your report status and details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackReport;
