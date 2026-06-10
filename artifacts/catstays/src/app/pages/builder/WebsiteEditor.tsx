import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import {
  Save,
  Eye,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  ChevronLeft,
  ChevronRight,
  Image,
  Type,
  Layout,
  Palette,
  Calendar,
  Settings,
  Upload,
  Search,
  Plus,
  FileText,
  Star,
  MessageSquare,
  DollarSign,
  HelpCircle,
  Phone,
  Sparkles
} from 'lucide-react';
const logoWordmark = '/assets/6461fe246edac7430bd3dd41a3c26b459650665f.png';

export function WebsiteEditor() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const pages = [
    { name: 'Home', path: '/', icon: Layout },
    { name: 'About', path: '/about', icon: FileText },
    { name: 'Rooms', path: '/rooms', icon: Layout },
    { name: 'Booking', path: '/booking', icon: Calendar },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  const contentBlocks = [
    { name: 'Hero Section', icon: Layout },
    { name: 'Image Gallery', icon: Image },
    { name: 'Testimonials', icon: MessageSquare },
    { name: 'Pricing Tables', icon: DollarSign },
    { name: 'FAQ', icon: HelpCircle },
    { name: 'Call To Action', icon: Sparkles },
    { name: 'Contact Form', icon: Phone },
  ];

  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* Top Bar */}
      <div className="bg-white border-b border-sage/10 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <img src={logoWordmark} alt="CatStays" className="h-8 w-auto" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-forest/60" />
            <span className="text-sm text-forest/70">whisker-haven.catstays.app</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 mr-2">
            <Button variant="ghost" size="sm" className="text-forest/60">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-forest/60">
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Device Toggle */}
          <div className="flex items-center gap-1 mx-2">
            <Button
              variant={deviceView === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView('desktop')}
              className={deviceView === 'desktop' ? 'bg-sage text-white' : 'text-forest/60'}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceView === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView('tablet')}
              className={deviceView === 'tablet' ? 'bg-sage text-white' : 'text-forest/60'}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceView === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView('mobile')}
              className={deviceView === 'mobile' ? 'bg-sage text-white' : 'text-forest/60'}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Actions */}
          <Button variant="outline" size="sm" className="text-forest border-sage/20">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" className="text-forest border-sage/20">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm" className="bg-sage hover:bg-sage-dark text-white">
            <Globe className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {leftPanelOpen && (
          <div className="w-72 bg-white border-r border-sage/10 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 bg-cream border-sage/10"
                  />
                </div>

                {/* Pages */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-forest">Pages</h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="w-4 h-4 text-sage" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {pages.map((page) => {
                      const Icon = page.icon;
                      return (
                        <button
                          key={page.path}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest/70 hover:bg-sage/5 hover:text-forest transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{page.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Content Blocks */}
                <div>
                  <h3 className="text-sm font-semibold text-forest mb-3">Content Blocks</h3>
                  <div className="space-y-1">
                    {contentBlocks.map((block) => {
                      const Icon = block.icon;
                      return (
                        <button
                          key={block.name}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest/70 hover:bg-sage/5 hover:text-forest transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{block.name}</span>
                          <Plus className="w-3 h-3 ml-auto text-sage" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-forest mb-3">Settings</h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest/70 hover:bg-sage/5 hover:text-forest transition-colors">
                      <Palette className="w-4 h-4" />
                      <span>Design</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest/70 hover:bg-sage/5 hover:text-forest transition-colors">
                      <Calendar className="w-4 h-4" />
                      <span>Booking</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest/70 hover:bg-sage/5 hover:text-forest transition-colors">
                      <Image className="w-4 h-4" />
                      <span>Media Library</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest/70 hover:bg-sage/5 hover:text-forest transition-colors">
                      <Search className="w-4 h-4" />
                      <span>SEO</span>
                    </button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <button
              onClick={() => setLeftPanelOpen(false)}
              className="p-2 border-t border-sage/10 hover:bg-sage/5 transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 text-forest/60" />
            </button>
          </div>
        )}

        {!leftPanelOpen && (
          <button
            onClick={() => setLeftPanelOpen(true)}
            className="w-12 bg-white border-r border-sage/10 hover:bg-sage/5 transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-forest/60" />
          </button>
        )}

        {/* Center Canvas */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-sage/5 to-cream p-8">
          <div
            className={`mx-auto bg-white shadow-2xl transition-all duration-300 ${
              deviceView === 'desktop'
                ? 'max-w-6xl'
                : deviceView === 'tablet'
                ? 'max-w-3xl'
                : 'max-w-md'
            }`}
          >
            {/* Website Preview Content */}
            <div className="relative group">
              {/* Hero Section (Editable) */}
              <div
                onClick={() => setSelectedElement('hero')}
                className={`relative cursor-pointer transition-all ${
                  selectedElement === 'hero' ? 'ring-2 ring-sage ring-offset-2' : 'hover:ring-2 hover:ring-sage/40'
                }`}
              >
                <div className="bg-gradient-to-r from-sage/10 to-rose/10 p-16 text-center">
                  <Badge className="bg-sage/10 text-sage border-sage/20 mb-4">
                    Welcome to
                  </Badge>
                  <h1 className="text-5xl font-serif font-semibold text-forest mb-4">
                    Whisker Haven Cattery
                  </h1>
                  <p className="text-xl text-forest/70 mb-8 max-w-2xl mx-auto">
                    Premium cat boarding in a calm, boutique environment
                  </p>
                  <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl px-8">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </div>
                {selectedElement === 'hero' && (
                  <div className="absolute top-2 right-2 bg-sage text-white text-xs px-2 py-1 rounded">
                    Hero Section
                  </div>
                )}
              </div>

              {/* Gallery Section (Editable) */}
              <div
                onClick={() => setSelectedElement('gallery')}
                className={`relative cursor-pointer transition-all ${
                  selectedElement === 'gallery' ? 'ring-2 ring-sage ring-offset-2' : 'hover:ring-2 hover:ring-sage/40'
                }`}
              >
                <div className="p-16">
                  <h2 className="text-3xl font-serif font-semibold text-forest text-center mb-8">
                    Our Luxury Rooms
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-sage/10 rounded-xl"></div>
                    ))}
                  </div>
                </div>
                {selectedElement === 'gallery' && (
                  <div className="absolute top-2 right-2 bg-sage text-white text-xs px-2 py-1 rounded">
                    Gallery Section
                  </div>
                )}
              </div>

              {/* CTA Section (Editable) */}
              <div
                onClick={() => setSelectedElement('cta')}
                className={`relative cursor-pointer transition-all ${
                  selectedElement === 'cta' ? 'ring-2 ring-sage ring-offset-2' : 'hover:ring-2 hover:ring-sage/40'
                }`}
              >
                <div className="bg-forest text-white p-16 text-center">
                  <h2 className="text-3xl font-serif font-semibold mb-4">
                    Ready to Book?
                  </h2>
                  <p className="text-white/80 mb-8">
                    Give your cat the luxury they deserve
                  </p>
                  <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl px-8">
                    Check Availability
                  </Button>
                </div>
                {selectedElement === 'cta' && (
                  <div className="absolute top-2 right-2 bg-sage text-white text-xs px-2 py-1 rounded">
                    CTA Section
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        {rightPanelOpen && selectedElement && (
          <div className="w-80 bg-white border-l border-sage/10 flex flex-col">
            <div className="p-4 border-b border-sage/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-forest">Properties</h3>
                <button onClick={() => setRightPanelOpen(false)}>
                  <ChevronRight className="w-4 h-4 text-forest/60" />
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                <Tabs defaultValue="style" className="w-full">
                  <TabsList className="w-full bg-cream">
                    <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
                    <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                    <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
                  </TabsList>

                  <TabsContent value="style" className="space-y-4 mt-4">
                    {/* Background Color */}
                    <div className="space-y-2">
                      <Label className="text-xs text-forest/70">Background Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#C86B3C" className="w-20 h-10" />
                        <Input defaultValue="#C86B3C" className="flex-1" />
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="space-y-2">
                      <Label className="text-xs text-forest/70">Text Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#1F2A44" className="w-20 h-10" />
                        <Input defaultValue="#1F2A44" className="flex-1" />
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                      <Label className="text-xs text-forest/70">Font Size</Label>
                      <Input type="number" defaultValue="48" />
                    </div>

                    {/* Font Weight */}
                    <div className="space-y-2">
                      <Label className="text-xs text-forest/70">Font Weight</Label>
                      <select className="w-full px-3 py-2 bg-cream border border-sage/10 rounded-lg text-sm">
                        <option>Regular</option>
                        <option>Medium</option>
                        <option selected>Semibold</option>
                        <option>Bold</option>
                      </select>
                    </div>

                    {/* Border Radius */}
                    <div className="space-y-2">
                      <Label className="text-xs text-forest/70">Border Radius</Label>
                      <Input type="number" defaultValue="12" />
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-4">
                    {selectedElement === 'hero' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs text-forest/70">Headline</Label>
                          <Input defaultValue="Whisker Haven Cattery" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-forest/70">Subheadline</Label>
                          <textarea
                            className="w-full px-3 py-2 bg-cream border border-sage/10 rounded-lg text-sm"
                            rows={3}
                            defaultValue="Premium cat boarding in a calm, boutique environment"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-forest/70">Button Text</Label>
                          <Input defaultValue="Book Now" />
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-forest/70">Padding (px)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="Top" defaultValue="64" />
                        <Input type="number" placeholder="Right" defaultValue="64" />
                        <Input type="number" placeholder="Bottom" defaultValue="64" />
                        <Input type="number" placeholder="Left" defaultValue="64" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-forest/70">Alignment</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">Left</Button>
                        <Button variant="default" size="sm" className="flex-1 bg-sage">Center</Button>
                        <Button variant="outline" size="sm" className="flex-1">Right</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                <Button variant="outline" className="w-full text-forest border-sage/20">
                  <Upload className="w-4 h-4 mr-2" />
                  Replace Image
                </Button>
              </div>
            </ScrollArea>
          </div>
        )}

        {!rightPanelOpen && (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="w-12 bg-white border-l border-sage/10 hover:bg-sage/5 transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-forest/60" />
          </button>
        )}
      </div>
    </div>
  );
}