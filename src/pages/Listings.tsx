import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProperties } from '@/data/mockData';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Listings() {
  const [savedListings, setSavedListings] = useState<string[]>(['prop-2']);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [bedroomFilter, setBedroomFilter] = useState<string>('all');

  const handleSave = (propertyId: string) => {
    setSavedListings((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const filteredProperties = mockProperties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice =
      priceFilter === 'all' ||
      (priceFilter === 'under-1500' && property.price < 1500) ||
      (priceFilter === '1500-2500' && property.price >= 1500 && property.price <= 2500) ||
      (priceFilter === 'above-2500' && property.price > 2500);

    const matchesBedrooms =
      bedroomFilter === 'all' ||
      (bedroomFilter === '1' && property.bedrooms === 1) ||
      (bedroomFilter === '2' && property.bedrooms === 2) ||
      (bedroomFilter === '3+' && property.bedrooms >= 3);

    return matchesSearch && matchesPrice && matchesBedrooms && property.available;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Property Listings</h1>
          <p className="text-muted-foreground">Browse all available rental properties</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-1500">Under RM 1,500</SelectItem>
                <SelectItem value="1500-2500">RM 1,500 - 2,500</SelectItem>
                <SelectItem value="above-2500">Above RM 2,500</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Beds</SelectItem>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3+">3+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
        </p>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PropertyCard
                  property={property}
                  isSaved={savedListings.includes(property.id)}
                  onSave={handleSave}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
