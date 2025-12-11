import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProperties, mockContracts } from '@/data/mockData';
import { FileText, Shield, ArrowLeft, Check, X, Building2, Calendar, DollarSign, PenTool, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Contract } from '@/types';

export default function ViewContract() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSigning, setIsSigning] = useState(false);
  const [localContract, setLocalContract] = useState<Contract | null>(null);

  const originalContract = mockContracts.find((c) => c.id === id);
  const property = mockProperties.find((p) => p.id === originalContract?.propertyId);
  const isLandlord = user?.role === 'landlord';

  useEffect(() => {
    if (originalContract) {
      setLocalContract({ ...originalContract });
    }
  }, [id]);

  if (!localContract || !property) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Contract Not Found</h3>
            <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const canSign = isLandlord
    ? localContract.photosApproved && localContract.tenantSigned && !localContract.landlordSigned
    : localContract.photosApproved && !localContract.tenantSigned;

  const handleSign = async () => {
    setIsSigning(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Update local state to reflect signing
    setLocalContract(prev => {
      if (!prev) return prev;
      if (isLandlord) {
        return { ...prev, landlordSigned: true, status: 'active' as const };
      } else {
        return { ...prev, tenantSigned: true, status: 'pending_signatures' as const };
      }
    });
    
    setIsSigning(false);
    
    const nextStep = isLandlord 
      ? 'Contract is now active! You can proceed to the escrow page.'
      : 'Waiting for landlord to sign.';
    
    toast.success('Contract signed successfully!', {
      description: `Your digital signature has been embedded with MyDigital ID. ${nextStep}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/contracts')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </Button>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Rental Agreement Contract
          </h1>
          <p className="text-muted-foreground">Contract ID: {localContract.id}</p>
        </div>

        {/* Contract Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Property</p>
                <p className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {property.title}
                </p>
                <p className="text-sm text-muted-foreground">{property.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenancy Period</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(localContract.startDate).toLocaleDateString()} - {new Date(localContract.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  RM {localContract.monthlyRent.toLocaleString()}/month
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Deposit</p>
                <p className="font-semibold">RM {localContract.depositAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Signature Status */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium">Signature Status</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  <span className="text-sm">Tenant:</span>
                  {localContract.tenantSigned ? (
                    <Badge variant="outline" className="text-success border-success">
                      <Check className="h-3 w-3 mr-1" />
                      Signed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <X className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  <span className="text-sm">Landlord:</span>
                  {localContract.landlordSigned ? (
                    <Badge variant="outline" className="text-success border-success">
                      <Check className="h-3 w-3 mr-1" />
                      Signed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <X className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="text-sm">Photos:</span>
                  {localContract.photosApproved ? (
                    <Badge variant="outline" className="text-success border-success">
                      <Check className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <X className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Document */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Terms</CardTitle>
            <CardDescription>Standard tenancy agreement template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">1. Parties</h3>
                <p className="text-muted-foreground">
                  This agreement is between the Landlord ({localContract.landlordIc}) and the Tenant ({localContract.tenantIc}).
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">2. Property</h3>
                <p className="text-muted-foreground">
                  The property located at {property.address}, {property.location} shall be rented to the Tenant.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">3. Term</h3>
                <p className="text-muted-foreground">
                  The tenancy shall commence on {new Date(localContract.startDate).toLocaleDateString()} and end on{' '}
                  {new Date(localContract.endDate).toLocaleDateString()}.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">4. Payment & Escrow</h3>
                <p className="text-muted-foreground">
                  Monthly rent of RM {localContract.monthlyRent.toLocaleString()} shall be paid on the first day of each month.
                  A security deposit of RM {localContract.depositAmount.toLocaleString()} (equivalent to 2 months rent) shall be
                  held in escrow and released according to the terms of this agreement.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">5. Maintenance</h3>
                <p className="text-muted-foreground">
                  The Tenant is responsible for maintaining the property in good condition. The Landlord is responsible for
                  structural repairs and major maintenance.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">6. Handover Photos</h3>
                <p className="text-muted-foreground">
                  The Landlord shall upload move-in inspection photos. The Tenant must approve these photos before signing
                  this contract. These photos serve as evidence of the property's condition at the start of tenancy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">7. Digital Signatures</h3>
                <p className="text-muted-foreground">
                  This contract uses MyDigital ID for digital signatures. Each signature includes the signer's name, IC
                  number, timestamp, and document hash for legal validity.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Signing Action */}
        {canSign && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Ready to Sign</p>
                  <p className="text-sm text-muted-foreground">
                    {localContract.photosApproved
                      ? 'All requirements are met. You can now sign this contract using MyDigital ID.'
                      : 'Please approve the inspection photos before signing.'}
                  </p>
                </div>
                <Button variant="mydigital-id" onClick={handleSign} disabled={isSigning}>
                  {isSigning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Sign via MyDigital ID
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

