import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Upload,
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Check,
  X,
  Save
} from 'lucide-react';

interface WebsiteSection {
  id: string;
  name: string;
  enabled: boolean;
  editable: boolean;
}

interface WebsiteSettings {
  logo: string | null;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  headingFont: string;
  bodyFont: string;
  template: 'boutique' | 'modern' | 'playful';
  density: 'spacious' | 'compact';
  sections: WebsiteSection[];
  content: {
    hero: {
      headline: string;
      subheadline: string;
      ctaText: string;
      backgroundImage: string;
    };
    about: {
      title: string;
      description: string;
      image: string;
    };
    rooms: {
      title: string;
      description: string;
    };
    pricing: {
      title: string;
    };
    gallery: {
      title: string;
      images: string[];
    };
    contact: {
      title: string;
      email: string;
      phone: string;
      address: string;
    };
  };
}

export function WebsiteBuilderStudio() {
  const [selectedSection, setSelectedSection] = useState<string | null>('hero');
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['branding', 'sections']);
  const [editingText, setEditingText] = useState<string | null>(null);

  const [settings, setSettings] = useState<WebsiteSettings>({
    logo: null,
    brandName: 'Whiskers Haven Cattery',
    primaryColor: '#C46A3A',
    secondaryColor: '#4F6F5A',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    template: 'boutique',
    density: 'spacious',
    sections: [
      { id: 'hero', name: 'Hero', enabled: true, editable: true },
      { id: 'about', name: 'About', enabled: true, editable: true },
      { id: 'rooms', name: 'Rooms', enabled: true, editable: true },
      { id: 'pricing', name: 'Pricing', enabled: true, editable: false },
      { id: 'gallery', name: 'Gallery', enabled: true, editable: true },
      { id: 'contact', name: 'Contact', enabled: true, editable: true },
    ],
    content: {
      hero: {
        headline: 'Boutique Luxury for Your Feline Family',
        subheadline: 'Premium cat boarding in a calm, home-like environment',
        ctaText: 'Book a Stay',
        backgroundImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&h=800&fit=crop',
      },
      about: {
        title: 'A Home Away From Home',
        description: 'We provide exceptional care in a boutique setting where your cat receives individual attention, premium amenities, and the peace you deserve.',
        image: 'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=600&h=800&fit=crop',
      },
      rooms: {
        title: 'Luxury Suites',
        description: 'Choose from our range of beautifully designed rooms',
      },
      pricing: {
        title: 'Transparent Pricing',
      },
      gallery: {
        title: 'Our Happy Guests',
        images: [
          'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1572404861854-e6cea65f47f9?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&h=400&fit=crop',
        ],
      },
      contact: {
        title: 'Get in Touch',
        email: 'hello@whiskershaven.com',
        phone: '+1 (555) 123-4567',
        address: '123 Peaceful Lane, Cat City, CC 12345',
      },
    },
  });

  const togglePanel = (panel: string) => {
    setExpandedPanels(prev =>
      prev.includes(panel) ? prev.filter(p => p !== panel) : [...prev, panel]
    );
  };

  const toggleSection = (sectionId: string) => {
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const updateContent = (path: string, value: string) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let obj: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      
      obj[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const templates = [
    {
      id: 'boutique',
      name: 'Boutique Luxury',
      description: 'Elegant serif fonts, warm colors',
      preview: '🏛️',
    },
    {
      id: 'modern',
      name: 'Clean Modern',
      description: 'Sans-serif, minimalist',
      preview: '⬜',
    },
    {
      id: 'playful',
      name: 'Playful Family',
      description: 'Rounded, friendly',
      preview: '🎨',
    },
  ];

  const fonts = {
    heading: ['Playfair Display', 'Merriweather', 'Lora', 'Poppins', 'Montserrat', 'Inter'],
    body: ['Inter', 'Open Sans', 'Roboto', 'Lato', 'Nunito', 'Work Sans'],
  };

  const handleInlineEdit = (path: string, element: HTMLElement) => {
    setEditingText(path);
    element.contentEditable = 'true';
    element.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleInlineBlur = (path: string, element: HTMLElement) => {
    setEditingText(null);
    element.contentEditable = 'false';
    updateContent(path, element.innerText);
  };

  const spacingClass = settings.density === 'spacious' ? 'py-24' : 'py-12';

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* LEFT PANEL - Controls */}
      <div className="w-[360px] bg-[#F8F9FA] border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-[#F8F9FA] z-10">
          <h1 className="text-xl font-bold text-[#0A1128]">Website Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Click any section to edit</p>
        </div>

        <div className="p-6 space-y-4">
          {/* BRANDING */}
          <Card className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => togglePanel('branding')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-[#C46A3A]" />
                <span className="font-semibold text-[#0A1128]">Branding</span>
              </div>
              {expandedPanels.includes('branding') ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandedPanels.includes('branding') && (
              <div className="p-4 pt-0 space-y-4 border-t border-gray-100">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <div className="flex items-center gap-3">
                    {settings.logo ? (
                      <img src={settings.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settings.brandName}
                    onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]/20 focus:border-[#C46A3A]"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Fonts */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Type className="w-4 h-4 inline mr-1" />
                      Heading Font
                    </label>
                    <select
                      value={settings.headingFont}
                      onChange={(e) => setSettings({ ...settings, headingFont: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]/20"
                      style={{ fontFamily: settings.headingFont }}
                    >
                      {fonts.heading.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Font
                    </label>
                    <select
                      value={settings.bodyFont}
                      onChange={(e) => setSettings({ ...settings, bodyFont: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]/20"
                      style={{ fontFamily: settings.bodyFont }}
                    >
                      {fonts.body.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* LAYOUT STYLE */}
          <Card className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => togglePanel('layout')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-[#C46A3A]" />
                <span className="font-semibold text-[#0A1128]">Layout Style</span>
              </div>
              {expandedPanels.includes('layout') ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandedPanels.includes('layout') && (
              <div className="p-4 pt-0 space-y-4 border-t border-gray-100">
                {/* Template Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Template
                  </label>
                  <div className="space-y-2">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setSettings({ ...settings, template: template.id as any })}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          settings.template === template.id
                            ? 'border-[#C46A3A] bg-[#C46A3A]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{template.preview}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-[#0A1128] mb-0.5">
                              {template.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {template.description}
                            </div>
                          </div>
                          {settings.template === template.id && (
                            <Check className="w-5 h-5 text-[#C46A3A] flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Density Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Spacing Density
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, density: 'spacious' })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        settings.density === 'spacious'
                          ? 'border-[#C46A3A] bg-[#C46A3A]/5 text-[#C46A3A]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Spacious
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, density: 'compact' })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        settings.density === 'compact'
                          ? 'border-[#C46A3A] bg-[#C46A3A]/5 text-[#C46A3A]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Compact
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* SECTIONS */}
          <Card className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => togglePanel('sections')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-[#C46A3A]" />
                <span className="font-semibold text-[#0A1128]">Sections</span>
              </div>
              {expandedPanels.includes('sections') ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandedPanels.includes('sections') && (
              <div className="border-t border-gray-100">
                {settings.sections.map(section => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-4 border-b border-gray-100 last:border-0 transition-colors ${
                      selectedSection === section.id ? 'bg-[#C46A3A]/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex-shrink-0"
                      >
                        {section.enabled ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <span className={`text-sm font-medium ${
                        section.enabled ? 'text-[#0A1128]' : 'text-gray-400'
                      }`}>
                        {section.name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedSection(section.id)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 p-6 bg-[#F8F9FA] border-t border-gray-200">
          <Button className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL - Live Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="min-h-full bg-white shadow-2xl">
          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-10 w-auto" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C46A3A]/20 to-[#4F6F5A]/20 flex items-center justify-center">
                    🐾
                  </div>
                )}
                <span 
                  className="text-xl font-bold"
                  style={{ 
                    fontFamily: settings.headingFont,
                    color: settings.primaryColor 
                  }}
                >
                  {settings.brandName}
                </span>
              </div>
              <div className="flex items-center gap-6">
                {settings.sections.filter(s => s.enabled).map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="text-sm font-medium text-gray-600 hover:text-[#0A1128] transition-colors"
                    style={{ fontFamily: settings.bodyFont }}
                  >
                    {section.name}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          {settings.sections.find(s => s.id === 'hero')?.enabled && (
            <section
              id="hero"
              onClick={() => setSelectedSection('hero')}
              className={`relative ${spacingClass} transition-all cursor-pointer ${
                selectedSection === 'hero' ? 'ring-4 ring-[#C46A3A]/30 ring-inset' : 'hover:ring-2 hover:ring-gray-200 hover:ring-inset'
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${settings.content.hero.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="max-w-4xl mx-auto px-6 text-center text-white">
                <h1
                  className="text-6xl font-bold mb-6 transition-all"
                  style={{ fontFamily: settings.headingFont }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineEdit('content.hero.headline', e.currentTarget);
                  }}
                  onBlur={(e) => handleInlineBlur('content.hero.headline', e.currentTarget)}
                  suppressContentEditableWarning
                >
                  {settings.content.hero.headline}
                </h1>
                <p
                  className="text-2xl mb-8 text-white/90"
                  style={{ fontFamily: settings.bodyFont }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineEdit('content.hero.subheadline', e.currentTarget);
                  }}
                  onBlur={(e) => handleInlineBlur('content.hero.subheadline', e.currentTarget)}
                  suppressContentEditableWarning
                >
                  {settings.content.hero.subheadline}
                </p>
                <button
                  className="px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  style={{
                    backgroundColor: settings.primaryColor,
                    color: 'white',
                    fontFamily: settings.bodyFont,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newText = prompt('Button text:', settings.content.hero.ctaText);
                    if (newText) updateContent('content.hero.ctaText', newText);
                  }}
                >
                  {settings.content.hero.ctaText}
                </button>
              </div>
            </section>
          )}

          {/* About Section */}
          {settings.sections.find(s => s.id === 'about')?.enabled && (
            <section
              id="about"
              onClick={() => setSelectedSection('about')}
              className={`${spacingClass} transition-all cursor-pointer bg-[#F8F7F5] ${
                selectedSection === 'about' ? 'ring-4 ring-[#C46A3A]/30 ring-inset' : 'hover:ring-2 hover:ring-gray-200 hover:ring-inset'
              }`}
            >
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2
                      className="text-5xl font-bold mb-6"
                      style={{ 
                        fontFamily: settings.headingFont,
                        color: settings.primaryColor 
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInlineEdit('content.about.title', e.currentTarget);
                      }}
                      onBlur={(e) => handleInlineBlur('content.about.title', e.currentTarget)}
                      suppressContentEditableWarning
                    >
                      {settings.content.about.title}
                    </h2>
                    <p
                      className="text-xl text-gray-700 leading-relaxed"
                      style={{ fontFamily: settings.bodyFont }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInlineEdit('content.about.description', e.currentTarget);
                      }}
                      onBlur={(e) => handleInlineBlur('content.about.description', e.currentTarget)}
                      suppressContentEditableWarning
                    >
                      {settings.content.about.description}
                    </p>
                  </div>
                  <div className="relative">
                    <img
                      src={settings.content.about.image}
                      alt="About"
                      className="rounded-3xl shadow-2xl w-full h-[500px] object-cover cursor-pointer hover:ring-4 hover:ring-[#C46A3A]/30 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newUrl = prompt('Image URL:', settings.content.about.image);
                        if (newUrl) updateContent('content.about.image', newUrl);
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Rooms Section */}
          {settings.sections.find(s => s.id === 'rooms')?.enabled && (
            <section
              id="rooms"
              onClick={() => setSelectedSection('rooms')}
              className={`${spacingClass} transition-all cursor-pointer ${
                selectedSection === 'rooms' ? 'ring-4 ring-[#C46A3A]/30 ring-inset' : 'hover:ring-2 hover:ring-gray-200 hover:ring-inset'
              }`}
            >
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2
                    className="text-5xl font-bold mb-4"
                    style={{ 
                      fontFamily: settings.headingFont,
                      color: settings.primaryColor 
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInlineEdit('content.rooms.title', e.currentTarget);
                    }}
                    onBlur={(e) => handleInlineBlur('content.rooms.title', e.currentTarget)}
                    suppressContentEditableWarning
                  >
                    {settings.content.rooms.title}
                  </h2>
                  <p
                    className="text-xl text-gray-600"
                    style={{ fontFamily: settings.bodyFont }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInlineEdit('content.rooms.description', e.currentTarget);
                    }}
                    onBlur={(e) => handleInlineBlur('content.rooms.description', e.currentTarget)}
                    suppressContentEditableWarning
                  >
                    {settings.content.rooms.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {['Standard Suite', 'Deluxe Room', 'Premium Villa'].map((room, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                      <img
                        src={`https://images.unsplash.com/photo-${['1514888286974-6c03e2ca1dba', '1573865526739-10c1de0e0ef2', '1518791841217-8f162f1e1131'][idx]}?w=400&h=300&fit=crop`}
                        alt={room}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: settings.headingFont }}>
                          {room}
                        </h3>
                        <p className="text-gray-600 mb-4" style={{ fontFamily: settings.bodyFont }}>
                          Comfortable space with premium amenities
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold" style={{ color: settings.primaryColor }}>
                            ${[45, 65, 95][idx]}/night
                          </span>
                          <button
                            className="px-4 py-2 rounded-lg font-medium"
                            style={{
                              backgroundColor: settings.primaryColor,
                              color: 'white',
                            }}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Gallery Section */}
          {settings.sections.find(s => s.id === 'gallery')?.enabled && (
            <section
              id="gallery"
              onClick={() => setSelectedSection('gallery')}
              className={`${spacingClass} bg-[#F8F7F5] transition-all cursor-pointer ${
                selectedSection === 'gallery' ? 'ring-4 ring-[#C46A3A]/30 ring-inset' : 'hover:ring-2 hover:ring-gray-200 hover:ring-inset'
              }`}
            >
              <div className="max-w-7xl mx-auto px-6">
                <h2
                  className="text-5xl font-bold text-center mb-16"
                  style={{ 
                    fontFamily: settings.headingFont,
                    color: settings.primaryColor 
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineEdit('content.gallery.title', e.currentTarget);
                  }}
                  onBlur={(e) => handleInlineBlur('content.gallery.title', e.currentTarget)}
                  suppressContentEditableWarning
                >
                  {settings.content.gallery.title}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {settings.content.gallery.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden group">
                      <img
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newUrl = prompt('Image URL:', img);
                          if (newUrl) {
                            const newImages = [...settings.content.gallery.images];
                            newImages[idx] = newUrl;
                            setSettings({
                              ...settings,
                              content: {
                                ...settings.content,
                                gallery: {
                                  ...settings.content.gallery,
                                  images: newImages,
                                },
                              },
                            });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Contact Section */}
          {settings.sections.find(s => s.id === 'contact')?.enabled && (
            <section
              id="contact"
              onClick={() => setSelectedSection('contact')}
              className={`${spacingClass} transition-all cursor-pointer ${
                selectedSection === 'contact' ? 'ring-4 ring-[#C46A3A]/30 ring-inset' : 'hover:ring-2 hover:ring-gray-200 hover:ring-inset'
              }`}
            >
              <div className="max-w-4xl mx-auto px-6">
                <h2
                  className="text-5xl font-bold text-center mb-12"
                  style={{ 
                    fontFamily: settings.headingFont,
                    color: settings.primaryColor 
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineEdit('content.contact.title', e.currentTarget);
                  }}
                  onBlur={(e) => handleInlineBlur('content.contact.title', e.currentTarget)}
                  suppressContentEditableWarning
                >
                  {settings.content.contact.title}
                </h2>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p
                        className="text-lg"
                        style={{ fontFamily: settings.bodyFont, color: settings.primaryColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInlineEdit('content.contact.email', e.currentTarget);
                        }}
                        onBlur={(e) => handleInlineBlur('content.contact.email', e.currentTarget)}
                        suppressContentEditableWarning
                      >
                        {settings.content.contact.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <p
                        className="text-lg"
                        style={{ fontFamily: settings.bodyFont, color: settings.primaryColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInlineEdit('content.contact.phone', e.currentTarget);
                        }}
                        onBlur={(e) => handleInlineBlur('content.contact.phone', e.currentTarget)}
                        suppressContentEditableWarning
                      >
                        {settings.content.contact.phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <p
                        className="text-lg"
                        style={{ fontFamily: settings.bodyFont }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInlineEdit('content.contact.address', e.currentTarget);
                        }}
                        onBlur={(e) => handleInlineBlur('content.contact.address', e.currentTarget)}
                        suppressContentEditableWarning
                      >
                        {settings.content.contact.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="bg-[#0A1128] text-white py-12">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p style={{ fontFamily: settings.bodyFont }}>
                © 2026 {settings.brandName}. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}