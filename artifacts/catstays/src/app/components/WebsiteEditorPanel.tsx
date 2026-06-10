import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Wand2 } from 'lucide-react';

interface WebsiteEditorPanelProps {
  data: any;
  setData: (data: any) => void;
  onAIRegenerate?: (field: string) => void;
  isRegenerating?: boolean;
}

export function WebsiteEditorPanel({ data, setData, onAIRegenerate, isRegenerating }: WebsiteEditorPanelProps) {
  const handleAIClick = (field: string) => {
    if (onAIRegenerate) {
      onAIRegenerate(field);
    }
  };

  return (
    <Accordion type="multiple" defaultValue={['hero', 'about']} className="space-y-2">
      {/* HERO SECTION */}
      <AccordionItem value="hero" className="border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">Hero Section</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hero Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('heroHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.heroHeading || ''}
              onChange={(e) => setData({ ...data, heroHeading: e.target.value })}
              placeholder="Welcome to Our Cattery"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hero Subheading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('heroSubheading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.heroSubheading || ''}
              onChange={(e) => setData({ ...data, heroSubheading: e.target.value })}
              placeholder="Premium care for your feline friends"
              className="rounded-lg"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Hero Image URL</Label>
            <Input
              value={data.heroImage || ''}
              onChange={(e) => setData({ ...data, heroImage: e.target.value })}
              placeholder="https://..."
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Call-to-Action Button Text</Label>
            <Input
              value={data.ctaText || ''}
              onChange={(e) => setData({ ...data, ctaText: e.target.value })}
              placeholder="Book Now"
              className="rounded-lg"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ABOUT SECTION */}
      <AccordionItem value="about" className="border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">About Section</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>About Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('aboutHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.aboutHeading || ''}
              onChange={(e) => setData({ ...data, aboutHeading: e.target.value })}
              placeholder="About Our Cattery"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>About Text</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('aboutText')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.aboutText || ''}
              onChange={(e) => setData({ ...data, aboutText: e.target.value })}
              placeholder="Tell your story..."
              className="rounded-lg"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>About Image URL</Label>
            <Input
              value={data.aboutImage || ''}
              onChange={(e) => setData({ ...data, aboutImage: e.target.value })}
              placeholder="https://..."
              className="rounded-lg"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* FACILITIES SECTION */}
      <AccordionItem value="facilities" className="border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">Facilities Section</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Facilities Text</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('facilitiesText')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.facilitiesText || ''}
              onChange={(e) => setData({ ...data, facilitiesText: e.target.value })}
              placeholder="Describe your facilities..."
              className="rounded-lg"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Facilities Image URL</Label>
            <Input
              value={data.facilitiesImage || ''}
              onChange={(e) => setData({ ...data, facilitiesImage: e.target.value })}
              placeholder="https://..."
              className="rounded-lg"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* CONTACT SECTION */}
      <AccordionItem value="contact" className="border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">Contact Information</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input
              value={data.businessName || ''}
              onChange={(e) => setData({ ...data, businessName: e.target.value })}
              placeholder="CatStays Premium"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={data.phone || ''}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              value={data.email || ''}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="hello@cattery.com"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Full Address</Label>
            <Textarea
              value={data.address || ''}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="123 Cat Lane, Feline City, FC 12345"
              className="rounded-lg"
              rows={2}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* DESIGN SECTION */}
      <AccordionItem value="design" className="border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">Design & Colors</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data.primaryColor || '#0A1128'}
                onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={data.primaryColor || '#0A1128'}
                onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                placeholder="#0A1128"
                className="flex-1 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data.accentColor || '#C46A3A'}
                onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={data.accentColor || '#C46A3A'}
                onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                placeholder="#C46A3A"
                className="flex-1 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data.backgroundColor || '#F8F7F5'}
                onChange={(e) => setData({ ...data, backgroundColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={data.backgroundColor || '#F8F7F5'}
                onChange={(e) => setData({ ...data, backgroundColor: e.target.value })}
                placeholder="#F8F7F5"
                className="flex-1 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Typography</Label>
            <select
              value={data.typography || 'playfair'}
              onChange={(e) => setData({ ...data, typography: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg"
            >
              <option value="playfair">Playfair Display (Serif)</option>
              <option value="inter">Inter (Sans-serif)</option>
              <option value="poppins">Poppins (Sans-serif)</option>
              <option value="nunito">Nunito (Sans-serif)</option>
            </select>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
