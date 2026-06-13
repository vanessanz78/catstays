import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatWidgetProps {
  primaryColor?: string;
  accentColor?: string;
  businessName?: string;
  knowledge?: ChatKnowledge;
}

interface ChatKnowledge {
  business?: {
    name?: string;
    location?: string;
  };
  footer?: {
    phone?: string;
    email?: string;
    address?: string;
    hours?: string;
  };
  booking?: {
    text?: string;
    primaryCta?: string;
  };
  suites?: Array<{
    title?: string;
    text?: string;
    price?: string;
    features?: string[];
  }>;
  services?: Array<{
    title?: string;
    text?: string;
    price?: string;
  }>;
  faqs?: Array<{
    question?: string;
    answer?: string;
  }>;
  locationDetails?: {
    text?: string;
    directions?: string;
    virtualTourUrl?: string;
  };
}

type ChatMessage = { sender: 'bot' | 'user'; text: string };

export function ChatWidget({ accentColor = '#C46A3A', businessName = 'CatStays', knowledge }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: `Hi! Welcome to ${businessName}. How can we help you today?` }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = { sender: 'user', text: inputValue };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');

    const response = answerFromKnowledge(inputValue, knowledge, businessName);
    setTimeout(() => {
      setMessages([...newMessages, { sender: 'bot', text: response }]);
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
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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

function answerFromKnowledge(question: string, knowledge: ChatKnowledge | undefined, businessName: string) {
  const normalized = question.toLowerCase();
  const footer = knowledge?.footer;
  const suites = knowledge?.suites ?? [];
  const services = knowledge?.services ?? [];
  const faqs = knowledge?.faqs ?? [];
  const location = knowledge?.locationDetails;

  const matchedFaq = findMatchingFaq(question, faqs);
  if (matchedFaq) return matchedFaq;

  if (matches(normalized, ['hour', 'open', 'close', 'appointment', 'drop off', 'pickup', 'pick up', 'collect'])) {
    const hours = footer?.hours || 'hours are arranged by appointment';
    const contact = footer?.phone ? ` You can call or text ${footer.phone} to arrange a time.` : '';
    return `${businessName} is open by arrangement: ${hours}.${contact}`;
  }

  if (matches(normalized, ['price', 'rate', 'cost', 'charge', 'fee', 'suite', 'room', 'boarding'])) {
    const pricedSuites = suites.filter((suite) => suite.title || suite.price || suite.text).slice(0, 4);
    if (pricedSuites.length) {
      return pricedSuites
        .map((suite) => `${suite.title || 'Room'}${suite.price ? `: ${suite.price}` : ''}${suite.text ? ` - ${suite.text}` : ''}`)
        .join('\n');
    }
    return knowledge?.booking?.text || `The team at ${businessName} can confirm availability and pricing for your cat's stay.`;
  }

  if (matches(normalized, ['service', 'groom', 'brush', 'medication', 'medicine', 'injection', 'vet', 'airport', 'transport'])) {
    const relevant = services.filter((service) => {
      const text = `${service.title || ''} ${service.text || ''}`.toLowerCase();
      return normalized.split(/\W+/).some((token) => token.length > 3 && text.includes(token));
    });
    const selected = (relevant.length ? relevant : services).slice(0, 4);
    if (selected.length) {
      return selected
        .map((service) => `${service.title || 'Service'}${service.price ? ` (${service.price})` : ''}: ${service.text || 'Available during your cat stay.'}`)
        .join('\n');
    }
  }

  if (matches(normalized, ['where', 'address', 'location', 'directions', 'map'])) {
    const address = footer?.address || location?.text || knowledge?.business?.location;
    const directions = location?.directions ? ` ${location.directions}` : '';
    return address ? `${businessName} is at ${address}.${directions}` : `${businessName} can share location details when you enquire.`;
  }

  if (matches(normalized, ['contact', 'phone', 'email', 'call', 'text', 'message', 'enquiry', 'inquiry'])) {
    const details = [footer?.phone ? `phone/text ${footer.phone}` : '', footer?.email ? `email ${footer.email}` : ''].filter(Boolean).join(' or ');
    return details ? `You can contact ${businessName} by ${details}.` : `Send an enquiry and the ${businessName} team will follow up.`;
  }

  if (matches(normalized, ['book', 'booking', 'availability', 'reserve', 'stay'])) {
    return knowledge?.booking?.text
      ? `${knowledge.booking.text} In this preview, booking requests show how the live flow will connect to the CatStays dashboard.`
      : `Use the booking form to request dates for your cat's stay. In preview mode, it shows how live bookings will work.`;
  }

  const quickFacts = [
    footer?.hours ? `Hours: ${footer.hours}` : '',
    footer?.address ? `Address: ${footer.address}` : '',
    footer?.phone ? `Phone/text: ${footer.phone}` : '',
    footer?.email ? `Email: ${footer.email}` : '',
  ].filter(Boolean);

  if (quickFacts.length) {
    return `I can help with ${businessName} details. ${quickFacts.join(' ')}`;
  }

  return `Thanks for your message. The ${businessName} team can help with bookings, care needs, room options, and contact details.`;
}

function matches(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function findMatchingFaq(question: string, faqs: NonNullable<ChatKnowledge['faqs']>) {
  const tokens = question
    .toLowerCase()
    .split(/\W+/)
    .filter((token) => token.length > 3 && !['what', 'when', 'where', 'which', 'your', 'with', 'from', 'that', 'this', 'have'].includes(token));

  if (!tokens.length) return '';

  const match = faqs.find((faq) => {
    const haystack = `${faq.question || ''} ${faq.answer || ''}`.toLowerCase();
    return tokens.some((token) => haystack.includes(token));
  });

  return match?.answer || '';
}
