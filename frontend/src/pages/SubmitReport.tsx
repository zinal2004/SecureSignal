import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, Image, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const SubmitReport = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    crimeType: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    dateTime: '',
    isAnonymous: true,
    reporterInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((typeof prev[parent as keyof typeof prev] === 'object' && prev[parent as keyof typeof prev] !== null) ? prev[parent as keyof typeof prev] : {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (selectedImages.length + imageFiles.length > 5) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.crimeType || !formData.location.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('crimeType', formData.crimeType);
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('dateTime', formData.dateTime || new Date().toISOString());
      submitData.append('isAnonymous', formData.isAnonymous.toString());
      
      if (!formData.isAnonymous) {
        submitData.append('reporterInfo', JSON.stringify(formData.reporterInfo));
      }

      // Add images only
      selectedImages.forEach((file, index) => {
        submitData.append('images', file);
      });

      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        body: submitData, // Don't set Content-Type header for FormData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Report Submitted Successfully",
          description: `Your report has been submitted. Report ID: ${data.report.id}`,
        });
        navigate(`/track/${data.report.id}`);
      } else {
        toast({
          title: "Submission Failed",
          description: data.message || "An error occurred while submitting your report.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Crime Report</h1>
          <p className="text-gray-600">Help keep your community safe by reporting incidents.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the incident"
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a detailed description of what happened..."
                  rows={4}
                  maxLength={2000}
                />
              </div>

              <div>
                <Label htmlFor="crimeType">Type of Crime *</Label>
                <Select value={formData.crimeType} onValueChange={(value) => handleInputChange('crimeType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crime type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Theft">Theft</SelectItem>
                    <SelectItem value="Assault">Assault</SelectItem>
                    <SelectItem value="Vandalism">Vandalism</SelectItem>
                    <SelectItem value="Fire">Fire</SelectItem>
                    <SelectItem value="Domestic Violence">Domestic Violence</SelectItem>
                    <SelectItem value="Fraud">Fraud</SelectItem>
                    <SelectItem value="Cybercrime">Cybercrime</SelectItem>
                    <SelectItem value="Traffic Violation">Traffic Violation</SelectItem>
                    <SelectItem value="Public Disturbance">Public Disturbance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  placeholder="Street address where the incident occurred"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.location.zipCode}
                    onChange={(e) => handleInputChange('location.zipCode', e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dateTime">Date & Time of Incident</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => handleInputChange('dateTime', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence & Documentation</CardTitle>
              <p className="text-sm text-gray-600">Upload relevant images to support your report.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label>Images (Max 5, JPG, PNG, GIF)</Label>
                <div className="mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500 font-medium">
                          Click to upload images
                        </span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
                
                {selectedImages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Selected Images:</h4>
                    {selectedImages.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Image className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(file.size)}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reporter Information */}
          <Card>
            <CardHeader>
              <CardTitle>Reporter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked.toString())}
                  className="rounded"
                />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>

              {!formData.isAnonymous && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.reporterInfo.name}
                      onChange={(e) => handleInputChange('reporterInfo.name', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.reporterInfo.email}
                      onChange={(e) => handleInputChange('reporterInfo.email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.reporterInfo.phone}
                      onChange={(e) => handleInputChange('reporterInfo.phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Privacy & Security</p>
              <p>Your information is encrypted and protected. Anonymous reports are completely confidential.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default SubmitReport;
