import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DesignColorsPanelProps {
  data: any;
  setData: (data: any) => void;
}

export function DesignColorsPanel({ data, setData }: DesignColorsPanelProps) {
  const colorPalettes = [
    { name: 'Boutique Navy', primary: '#0A1128', accent: '#C46A3A', bg: '#F8F7F5' },
    { name: 'Forest Green', primary: '#1B4332', accent: '#D4A373', bg: '#F8F5F2' },
    { name: 'Royal Purple', primary: '#3D1E6D', accent: '#E07A5F', bg: '#FBF8F3' },
    { name: 'Ocean Blue', primary: '#003D5B', accent: '#F1A208', bg: '#F7F9FB' },
    { name: 'Charcoal', primary: '#2C3639', accent: '#A27B5C', bg: '#F5F5F5' },
    { name: 'Burgundy', primary: '#641220', accent: '#D4A276', bg: '#FAF7F5' },
  ];

  const applyPalette = (palette: typeof colorPalettes[0]) => {
    setData({
      ...data,
      primaryColor: palette.primary,
      accentColor: palette.accent,
      backgroundColor: palette.bg,
    });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Color Palette</h3>
        <div className="grid grid-cols-2 gap-3">
          {colorPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => applyPalette(palette)}
              className="p-3 border-2 rounded-lg hover:border-gray-400 transition-colors text-left"
              style={{
                borderColor: data.primaryColor === palette.primary && data.accentColor === palette.accent ? palette.primary : '#e5e7eb'
              }}
            >
              <div className="flex gap-2 mb-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: palette.primary }}></div>
                <div className="w-8 h-8 rounded" style={{ backgroundColor: palette.accent }}></div>
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: palette.bg }}></div>
              </div>
              <p className="text-sm font-medium">{palette.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Colors</h3>
        
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
          <p className="text-xs text-gray-500">Used for headings and primary elements</p>
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
          <p className="text-xs text-gray-500">Used for buttons and highlights</p>
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
          <p className="text-xs text-gray-500">Used for section backgrounds</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Typography</h3>
        
        <div className="space-y-2">
          <Label>Heading Font</Label>
          <select
            value={data.headingFont || 'playfair'}
            onChange={(e) => setData({ ...data, headingFont: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg"
          >
            <option value="playfair">Playfair Display (Elegant Serif)</option>
            <option value="merriweather">Merriweather (Classic Serif)</option>
            <option value="poppins">Poppins (Modern Sans-serif)</option>
            <option value="montserrat">Montserrat (Bold Sans-serif)</option>
            <option value="inter">Inter (Clean Sans-serif)</option>
            <option value="nunito">Nunito (Friendly Sans-serif)</option>
            <option value="lato">Lato (Professional)</option>
            <option value="opensans">Open Sans (Readable)</option>
            <option value="roboto">Roboto (Neutral)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Subheading Font</Label>
          <select
            value={data.subheadingFont || 'inter'}
            onChange={(e) => setData({ ...data, subheadingFont: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg"
          >
            <option value="playfair">Playfair Display (Elegant Serif)</option>
            <option value="merriweather">Merriweather (Classic Serif)</option>
            <option value="poppins">Poppins (Modern Sans-serif)</option>
            <option value="montserrat">Montserrat (Bold Sans-serif)</option>
            <option value="inter">Inter (Clean Sans-serif)</option>
            <option value="nunito">Nunito (Friendly Sans-serif)</option>
            <option value="lato">Lato (Professional)</option>
            <option value="opensans">Open Sans (Readable)</option>
            <option value="roboto">Roboto (Neutral)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>All Other Text (Body/Paragraph Font)</Label>
          <select
            value={data.bodyFont || 'inter'}
            onChange={(e) => setData({ ...data, bodyFont: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg"
          >
            <option value="playfair">Playfair Display (Elegant Serif)</option>
            <option value="merriweather">Merriweather (Classic Serif)</option>
            <option value="poppins">Poppins (Modern Sans-serif)</option>
            <option value="montserrat">Montserrat (Bold Sans-serif)</option>
            <option value="inter">Inter (Clean Sans-serif)</option>
            <option value="nunito">Nunito (Friendly Sans-serif)</option>
            <option value="lato">Lato (Professional)</option>
            <option value="opensans">Open Sans (Readable)</option>
            <option value="roboto">Roboto (Neutral)</option>
          </select>
        </div>
      </div>
    </div>
  );
}