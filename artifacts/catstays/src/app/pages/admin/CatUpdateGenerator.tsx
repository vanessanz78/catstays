import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Label } from '../../components/ui/label';
import {
  Menu, Camera, Sparkles, Send, Copy, RefreshCw,
  MessageSquare, Mail, Facebook, Instagram, Globe
} from 'lucide-react';

export function CatUpdateGenerator() {
  const navigate = useNavigate();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [generatedOwnerMessage, setGeneratedOwnerMessage] = useState('');
  const [generatedSocialPost, setGeneratedSocialPost] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleImageUpload = () => {
    setImageUploaded(true);
  };

  const handleGenerate = () => {
    setGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      setGeneratedOwnerMessage(
        "Hi Mum! 🐱\n\nI'm having the most wonderful time at my luxury holiday here at Deloraine Cattery! Today I spent hours bird watching from my private sun deck - there were so many colourful birds to watch. The staff gave me extra pats and treats, and I've been napping in the comfiest spot all afternoon.\n\nDon't worry about me - I'm living my best life! See you soon!\n\nLove,\nWhiskers 💕"
      );

      setGeneratedSocialPost(
        "Meet Whiskers enjoying her luxury cattery holiday! 🐱✨\n\nThis gorgeous girl spent her morning bird watching from her private sun deck at Deloraine Cattery. She's living her best life with premium accommodation, gourmet meals, and plenty of attention from our caring staff.\n\nYour cat deserves a holiday too! Book now at delorainecattery.catstays.app\n\n#DeloraineCattery #CatBoarding #LuxuryPetCare #WhangāreiCats #HappyCats #CatHoliday #PetCareNZ"
      );

      setGenerating(false);
    }, 1500);
  };

  const handleSendSMS = () => {
    alert('SMS sent to owner: 021 123 4567');
  };

  const handleSendEmail = () => {
    alert('Email sent to: sarah@example.com');
  };

  const handlePostSocial = (platform: string) => {
    alert(`Posted to ${platform}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">AI Cat Update Generator</h1>
            <p className="text-xs text-gray-500">Create personalized updates instantly</p>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-20">
        {/* Select Booking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Cat</CardTitle>
            <CardDescription>Choose which cat to create an update for</CardDescription>
          </CardHeader>
          <CardContent>
            <select className="w-full border rounded-md p-2">
              <option>Whiskers - Sarah Johnson (Room 3)</option>
              <option>Luna & Shadow - Mike Chen (Room 7)</option>
              <option>Tiger - John Smith (Room 5)</option>
              <option>Bella - Anna Lee (Room 4)</option>
            </select>
          </CardContent>
        </Card>

        {/* Upload Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-500" />
              Take or Upload Photo
            </CardTitle>
            <CardDescription>Capture a special moment</CardDescription>
          </CardHeader>
          <CardContent>
            {!imageUploaded ? (
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={handleImageUpload}>
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo
                </Button>
                <Button className="w-full" variant="outline" size="lg" onClick={handleImageUpload}>
                  <Camera className="w-5 h-5 mr-2" />
                  Choose from Gallery
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🐱</div>
                    <p className="text-sm text-gray-600">Photo: Whiskers bird watching</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setImageUploaded(false)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Choose Different Photo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        {imageUploaded && !generatedOwnerMessage && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Captions
              </>
            )}
          </Button>
        )}

        {/* Generated Content */}
        {generatedOwnerMessage && (
          <Card className="border-2 border-purple-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-lg">AI Generated Updates</CardTitle>
                </div>
                <Badge className="bg-purple-500">Ready to Send</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="owner">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="owner">Owner Message</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                </TabsList>

                <TabsContent value="owner" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Message from Whiskers</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerate}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                    <Textarea
                      value={generatedOwnerMessage}
                      onChange={(e) => setGeneratedOwnerMessage(e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleSendSMS}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send SMS
                    </Button>
                    <Button variant="outline" onClick={handleSendEmail}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    <p className="font-medium mb-1">Owner Contact</p>
                    <p className="text-xs">Mobile: 021 123 4567</p>
                    <p className="text-xs">Email: sarah@example.com</p>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Social Media Caption</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerate}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                    <Textarea
                      value={generatedSocialPost}
                      onChange={(e) => setGeneratedSocialPost(e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handlePostSocial('Facebook')}
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => handlePostSocial('Instagram')}
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePostSocial('Website')}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Website Feed
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(generatedSocialPost)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <p className="font-medium mb-1">💡 Tip</p>
                    <p className="text-xs">
                      This post will automatically be added to the Stay Story timeline for Whiskers
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update History (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 text-center py-4">
                No updates sent yet today
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
