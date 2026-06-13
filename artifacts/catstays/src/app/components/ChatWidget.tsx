import { useEffect, useRef, useState } from 'react';
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
type AnswerResult = { text: string; ownerFollowUp?: boolean };

export function ChatWidget({ accentColor = '#C46A3A', businessName = 'CatStays', knowledge }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: `Hi! Welcome to ${businessName}. How can we help you today?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [awaitingOwnerEmail, setAwaitingOwnerEmail] = useState(false);
  const [pendingOwnerQuestion, setPendingOwnerQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isOpen, messages]);

  const handleSend = () => {
    const messageText = inputValue.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = { sender: 'user', text: messageText };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');

    let response: AnswerResult;
    if (awaitingOwnerEmail) {
      if (isLikelyEmail(messageText)) {
        const topic = pendingOwnerQuestion ? ` about "${pendingOwnerQuestion}"` : '';
        response = {
          text: `Thanks. I'll send this chat thread${topic} to the owner so they can reply to ${messageText}. Please allow up to 24 hours for a response.`,
        };
        setAwaitingOwnerEmail(false);
        setPendingOwnerQuestion('');
      } else {
        response = {
          text: `Please enter your email address and I'll send this chat thread to the owner. They can reply with the right details within 24 hours.`,
        };
      }
    } else {
      response = answerFromKnowledge(messageText, knowledge, businessName);
      if (response.ownerFollowUp) {
        setAwaitingOwnerEmail(true);
        setPendingOwnerQuestion(messageText);
      }
    }

    setTimeout(() => {
      setMessages([...newMessages, { sender: 'bot', text: response.text }]);
    }, 450);
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
            <div ref={messagesEndRef} />
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

function answerFromKnowledge(question: string, knowledge: ChatKnowledge | undefined, businessName: string): AnswerResult {
  const normalized = question.toLowerCase();
  const footer = knowledge?.footer;
  const suites = knowledge?.suites ?? [];
  const services = knowledge?.services ?? [];
  const faqs = knowledge?.faqs ?? [];
  const location = knowledge?.locationDetails;

  if (matches(normalized, ['hour', 'open', 'close', 'appointment', 'drop off', 'pickup', 'pick up', 'collect'])) {
    const hours = footer?.hours || 'hours are arranged by appointment';
    const contact = footer?.phone ? ` You can call or text ${footer.phone} to arrange a time.` : '';
    return { text: `${businessName} is open by arrangement: ${hours}.${contact}` };
  }

  if (matches(normalized, ['price', 'rate', 'cost', 'charge', 'fee', 'suite', 'room', 'boarding'])) {
    const pricedSuites = suites.filter((suite) => suite.title || suite.price || suite.text).slice(0, 4);
    if (pricedSuites.length) {
      return {
        text: pricedSuites
        .map((suite) => `${suite.title || 'Room'}${suite.price ? `: ${suite.price}` : ''}${suite.text ? ` - ${suite.text}` : ''}`)
        .join('\n'),
      };
    }
    return { text: knowledge?.booking?.text || `The team at ${businessName} can confirm availability and pricing for your cat's stay.` };
  }

  if (matches(normalized, ['service', 'groom', 'brush', 'medication', 'medicine', 'injection', 'vet', 'airport', 'transport'])) {
    const relevant = services.filter((service) => {
      const text = `${service.title || ''} ${service.text || ''}`.toLowerCase();
      return normalized.split(/\W+/).some((token) => token.length > 3 && text.includes(token));
    });
    const selected = (relevant.length ? relevant : services).slice(0, 4);
    if (selected.length) {
      return {
        text: selected
        .map((service) => `${service.title || 'Service'}${service.price ? ` (${service.price})` : ''}: ${service.text || 'Available during your cat stay.'}`)
        .join('\n'),
      };
    }
  }

  if (matches(normalized, ['where', 'address', 'location', 'directions', 'map'])) {
    const address = footer?.address || location?.text || knowledge?.business?.location;
    const directions = location?.directions ? ` ${location.directions}` : '';
    return { text: address ? `${businessName} is at ${address}.${directions}` : `${businessName} can share location details when you enquire.` };
  }

  if (matches(normalized, ['contact', 'phone', 'email', 'call', 'text', 'message', 'enquiry', 'inquiry'])) {
    const details = [footer?.phone ? `phone/text ${footer.phone}` : '', footer?.email ? `email ${footer.email}` : ''].filter(Boolean).join(' or ');
    return { text: details ? `You can contact ${businessName} by ${details}.` : `Send an enquiry and the ${businessName} team will follow up.` };
  }

  if (matches(normalized, ['book', 'booking', 'availability', 'reserve', 'stay'])) {
    return {
      text: knowledge?.booking?.text
      ? `${knowledge.booking.text} In this preview, booking requests show how the live flow will connect to the CatStays dashboard.`
      : `Use the booking form to request dates for your cat's stay. In preview mode, it shows how live bookings will work.`,
    };
  }

  const matchedFaq = findMatchingFaq(question, faqs);
  if (matchedFaq) return { text: matchedFaq };

  const quickFacts = [
    footer?.hours ? `Hours: ${footer.hours}` : '',
    footer?.address ? `Address: ${footer.address}` : '',
    footer?.phone ? `Phone/text: ${footer.phone}` : '',
    footer?.email ? `Email: ${footer.email}` : '',
  ].filter(Boolean);

  if (quickFacts.length) {
    return {
      text: `I don't have that exact answer in the imported site content yet. Enter your email and I'll send this chat thread to the owner so they can reply. Please allow up to 24 hours.\n\nQuick details I do have: ${quickFacts.join(' ')}`,
      ownerFollowUp: true,
    };
  }

  return {
    text: `I don't have that answer in the imported site content yet. Enter your email and I'll send this chat thread to the owner so they can reply. Please allow up to 24 hours.`,
    ownerFollowUp: true,
  };
}

function matches(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function findMatchingFaq(question: string, faqs: NonNullable<ChatKnowledge['faqs']>) {
  const tokens = question
    .toLowerCase()
    .split(/\W+/)
    .filter((token) => token.length > 3 && !['what', 'when', 'where', 'which', 'your', 'with', 'from', 'that', 'this', 'have', 'does', 'much', 'many'].includes(token));

  if (!tokens.length) return '';

  let bestMatch = '';
  let bestScore = 0;

  faqs.forEach((faq) => {
    const haystack = `${faq.question || ''} ${faq.answer || ''}`.toLowerCase();
    const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq.answer || '';
    }
  });

  return bestScore >= Math.min(2, tokens.length) ? bestMatch : '';
}

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
