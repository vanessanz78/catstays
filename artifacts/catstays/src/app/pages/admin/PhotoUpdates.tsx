import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { 
  Camera, 
  Wand2, 
  Send, 
  Mail, 
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Share2,
  Cat
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

// Mock boarding cats data
const mockBoardingCats = [
  {
    id: '1',
    name: 'Whiskers',
    ownerName: 'Sarah Johnson',
    ownerEmail: 'sarah@example.com',
    ownerPhone: '+64 21 123 4567',
    room: 'Private Room 12',
    checkIn: '2026-03-15',
    checkOut: '2026-03-22'
  },
  {
    id: '2',
    name: 'Luna',
    ownerName: 'Michael Chen',
    ownerEmail: 'michael@example.com',
    ownerPhone: '+64 21 987 6543',
    room: 'Indoor Room 5',
    checkIn: '2026-03-14',
    checkOut: '2026-03-20'
  },
  {
    id: '3',
    name: 'Oliver',
    ownerName: 'Emma Wilson',
    ownerEmail: 'emma@example.com',
    ownerPhone: '+64 21 456 7890',
    room: 'Private Room 8',
    checkIn: '2026-03-16',
    checkOut: '2026-03-19'
  }
];

export function PhotoUpdates() {
  const [selectedCat, setSelectedCat] = useState(mockBoardingCats[0]);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<'email' | 'sms' | 'both'>('email');
  const [updateSent, setUpdateSent] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCaption = async () => {
    setIsGenerating(true);
    // Simulate AI caption generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const captions = [
      `Having the BEST time at my holiday home! Just finished a delicious breakfast and now it's time for my morning sunbathing session. The staff here really know how to treat a cat right! 😸`,
      `Life is purrfect here! Spent the afternoon exploring my cozy room and made friends with the humans. They give the best chin scratches! Can't wait for naptime. 🐱`,
      `Living my best life! Today I discovered the most amazing sunny spot by the window. The view is incredible and I've been keeping watch over all the birds outside. 10/10 would recommend this place! 🌞`,
      `Just checking in to say I'm having a wonderful time! The beds here are SO comfy and I've been treated like royalty. Don't worry about me - I'm eating well and getting plenty of rest between play sessions! 😺`,
      `Another paw-some day at my favorite getaway! Spent the morning playing and the afternoon napping (as one does). The staff here really understand what a cat needs. Missing you but having fun! 🐾`
    ];
    
    setCaption(captions[Math.floor(Math.random() * captions.length)]);
    setIsGenerating(false);
  };

  const sendUpdate = async () => {
    setIsSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate shareable URL
    const updateId = Math.random().toString(36).substr(2, 9);
    setShareUrl(`https://catstays.com/updates/${updateId}`);
    
    setIsSending(false);
    setUpdateSent(true);
    
    // Reset after 5 seconds
    setTimeout(() => {
      setUpdateSent(false);
      setUploadedImage('');
      setCaption('');
      setShareUrl('');
    }, 5000);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-forest mb-2">Photo Updates</h1>
        <p className="text-forest/70">Send adorable updates to cat owners with AI-generated captions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Cat Selection */}
        <div className="space-y-6">
          <Card className="border-sage/20 shadow-lg rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-serif text-forest">Currently Boarding</CardTitle>
              <CardDescription>Select a cat to send an update</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockBoardingCats.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedCat.id === cat.id
                        ? 'border-sage bg-sage/5'
                        : 'border-sage/10 hover:border-sage/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-forest flex items-center justify-center flex-shrink-0">
                        <Cat className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-forest">{cat.name}</div>
                        <div className="text-sm text-forest/60">{cat.ownerName}</div>
                      </div>
                      {selectedCat.id === cat.id && (
                        <Check className="w-5 h-5 text-sage" />
                      )}
                    </div>
                    <div className="mt-2 text-xs text-forest/60">
                      {cat.room}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Cat Info */}
          <Card className="border-sage/20 shadow-lg rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-serif text-forest">Owner Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-forest/60 mb-1">Email</div>
                <div className="text-sm text-forest">{selectedCat.ownerEmail}</div>
              </div>
              <div>
                <div className="text-xs text-forest/60 mb-1">Phone</div>
                <div className="text-sm text-forest">{selectedCat.ownerPhone}</div>
              </div>
              <div>
                <div className="text-xs text-forest/60 mb-1">Staying</div>
                <div className="text-sm text-forest">
                  {new Date(selectedCat.checkIn).toLocaleDateString()} - {new Date(selectedCat.checkOut).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Photo Upload & Caption */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-sage/20 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-forest flex items-center gap-2">
                <Camera className="w-6 h-6 text-sage" />
                Create Photo Update for {selectedCat.name}
              </CardTitle>
              <CardDescription>Upload a photo and generate an adorable caption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <div>
                <Label className="text-forest mb-3 block">Upload Photo</Label>
                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-sage/30 rounded-2xl p-12 text-center hover:border-sage/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-sage" />
                      </div>
                      <div className="text-forest font-semibold mb-2">Click to upload photo</div>
                      <div className="text-sm text-forest/60">JPG, PNG or GIF • Max 10MB</div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={uploadedImage} 
                      alt="Cat update" 
                      className="w-full h-80 object-cover rounded-2xl"
                    />
                    <button
                      onClick={() => setUploadedImage('')}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-forest hover:bg-white transition-colors"
                    >
                      Change Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Caption Generation */}
              {uploadedImage && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-forest">AI-Generated Caption</Label>
                      <Button
                        onClick={generateCaption}
                        disabled={isGenerating}
                        size="sm"
                        className="bg-sage hover:bg-sage-dark text-white rounded-xl"
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Caption
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Click 'Generate Caption' to create an adorable message from your cat's perspective..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={5}
                      className="rounded-xl resize-none"
                    />
                    <p className="text-xs text-forest/60 mt-2">
                      Tip: The caption is written from {selectedCat.name}'s perspective
                    </p>
                  </div>

                  {/* Send Method */}
                  <div>
                    <Label className="text-forest mb-3 block">Send Via</Label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSendMethod('email')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          sendMethod === 'email'
                            ? 'border-sage bg-sage/5'
                            : 'border-sage/10 hover:border-sage/30'
                        }`}
                      >
                        <Mail className={`w-5 h-5 mx-auto mb-2 ${sendMethod === 'email' ? 'text-sage' : 'text-forest/60'}`} />
                        <div className={`text-sm font-medium ${sendMethod === 'email' ? 'text-forest' : 'text-forest/60'}`}>Email</div>
                      </button>
                      <button
                        onClick={() => setSendMethod('sms')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          sendMethod === 'sms'
                            ? 'border-sage bg-sage/5'
                            : 'border-sage/10 hover:border-sage/30'
                        }`}
                      >
                        <MessageSquare className={`w-5 h-5 mx-auto mb-2 ${sendMethod === 'sms' ? 'text-sage' : 'text-forest/60'}`} />
                        <div className={`text-sm font-medium ${sendMethod === 'sms' ? 'text-forest' : 'text-forest/60'}`}>SMS</div>
                      </button>
                      <button
                        onClick={() => setSendMethod('both')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          sendMethod === 'both'
                            ? 'border-sage bg-sage/5'
                            : 'border-sage/10 hover:border-sage/30'
                        }`}
                      >
                        <Send className={`w-5 h-5 mx-auto mb-2 ${sendMethod === 'both' ? 'text-sage' : 'text-forest/60'}`} />
                        <div className={`text-sm font-medium ${sendMethod === 'both' ? 'text-forest' : 'text-forest/60'}`}>Both</div>
                      </button>
                    </div>
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={sendUpdate}
                    disabled={!caption || isSending || updateSent}
                    size="lg"
                    className="w-full bg-sage hover:bg-sage-dark text-white rounded-2xl py-6 text-lg shadow-lg"
                  >
                    {isSending ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Sending Update...
                      </>
                    ) : updateSent ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Update Sent!
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Update to {selectedCat.ownerName}
                      </>
                    )}
                  </Button>

                  {/* Success Message with Share URL */}
                  {updateSent && shareUrl && (
                    <Card className="border-green-200 bg-green-50 rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-900 mb-2">Update Sent Successfully!</h4>
                            <p className="text-sm text-green-800 mb-4">
                              {selectedCat.ownerName} will receive the photo update via {sendMethod === 'both' ? 'email and SMS' : sendMethod}.
                            </p>
                            
                            <div className="bg-white rounded-xl p-4 border border-green-200">
                              <div className="text-xs text-green-800 mb-2 font-medium">Shareable Link</div>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={shareUrl}
                                  readOnly
                                  className="flex-1 text-sm"
                                />
                                <Button
                                  onClick={copyShareUrl}
                                  size="sm"
                                  variant="outline"
                                  className="border-green-300"
                                >
                                  {copied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => window.open(shareUrl, '_blank')}
                                  size="sm"
                                  variant="outline"
                                  className="border-green-300"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-green-700 mt-2">
                                Pet owners can view and share this update on social media
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Preview Card */}
          {uploadedImage && caption && (
            <Card className="border-sage/20 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-forest">Preview</CardTitle>
                <CardDescription>How the update will appear to {selectedCat.ownerName}</CardDescription>
              </CardHeader>
              <CardContent>
                <Card className="border-sage/20 rounded-2xl overflow-hidden max-w-md mx-auto">
                  <img 
                    src={uploadedImage} 
                    alt="Cat update preview" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-forest flex items-center justify-center">
                        <Cat className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-forest">{selectedCat.name}</div>
                        <div className="text-xs text-forest/60">Deloraine Cattery</div>
                      </div>
                    </div>
                    
                    <p className="text-forest/80 leading-relaxed mb-4">
                      {caption}
                    </p>

                    <div className="pt-4 border-t border-sage/10">
                      <a 
                        href="https://catstays.com" 
                        className="text-xs text-forest/50 hover:text-sage transition-colors flex items-center gap-1"
                      >
                        Sent with <span className="font-semibold">CatStays</span>
                      </a>
                    </div>
                  </div>
                </Card>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
