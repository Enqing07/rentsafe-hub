import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { malaysianLocations } from '@/data/mockData';
import { User, Shield, MapPin, DollarSign, Save, Home, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.preferredLocation || '');
  const [budgetRange, setBudgetRange] = useState([user?.budgetMin || 1000, user?.budgetMax || 5000]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile
          </h1>
          <p className="text-muted-foreground">
            View and update your profile information
          </p>
        </div>

        {/* Verified Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Verified Information
            </CardTitle>
            <CardDescription>
              This information was verified through MyDigital ID and cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <Badge variant="secondary" className="capitalize mt-1">
                  {user?.role === 'landlord' ? (
                    <Building2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Home className="h-3 w-3 mr-1" />
                  )}
                  {user?.role}
                </Badge>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">IC Number</Label>
                <p className="font-medium">{user?.ic}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Age</Label>
                <p className="font-medium">{user?.age} years old</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <p className="font-medium capitalize">{user?.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Update your rental preferences and search filters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Preferred Location
              </Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {malaysianLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Range */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Range (Monthly)
              </Label>
              <div className="px-2">
                <Slider
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                  min={500}
                  max={15000}
                  step={100}
                  className="py-4"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">RM {budgetRange[0].toLocaleString()}</span>
                <span className="text-muted-foreground">to</span>
                <span className="font-medium">RM {budgetRange[1].toLocaleString()}</span>
              </div>
            </div>

            <Separator />

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
