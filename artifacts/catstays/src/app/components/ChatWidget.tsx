import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatWidgetProps {
  primaryColor?: string;
  accentColor?: string;
  businessName?: string;
}

export function ChatWidget({ accentColor = '#C46A3A', businessName = 'CatStays' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `Hi! Welcome to ${businessName}. How can we help you today?` }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: inputValue }];
    setMessages(newMessages);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      setMessages([...newMessages, { 
        sender: 'bot', 
        text: 'Thanks for your message! Our team will get back to you shortly. You can also call us or check our FAQ section.' 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button - Fixed bottom right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
          style={{ backgroundColor: accentColor }}
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] max-w-sm sm:w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div 
            className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between text-white"
            style={{ backgroundColor: accentColor }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs sm:text-sm truncate">{businessName}</div>
                <div className="text-xs text-white/80">Usually replies instantly</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto max-h-64 sm:max-h-96 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm break-words ${
                    msg.sender === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}
                  style={msg.sender === 'user' ? { backgroundColor: accentColor } : {}}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="rounded-full h-9 sm:h-10 text-xs sm:text-sm"
              />
              <Button
                onClick={handleSend}
                size="sm"
                className="rounded-full w-9 h-9 sm:w-10 sm:h-10 p-0 flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
