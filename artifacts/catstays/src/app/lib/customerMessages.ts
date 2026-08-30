export type CustomerMessageLike = {
  id: string;
  customer_id: string | null;
  subject: string | null;
  body: string;
  created_at: string;
};

export function messagesForCustomer<T extends CustomerMessageLike>(messages: T[], customerId: string) {
  return messages
    .filter((message) => message.customer_id === customerId)
    .sort((left, right) => left.created_at.localeCompare(right.created_at));
}

export function messageMatchesQuery(message: CustomerMessageLike, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return true;
  return [message.subject || '', message.body].some((value) => value.toLowerCase().includes(search));
}

export function customerFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'there';
}

export function quickCustomerMessage(customerName: string, catteryName: string) {
  return `Hi ${customerFirstName(customerName)},\n\nThanks for getting in touch. I will check this and come back to you shortly.\n\nWarm regards,\n${catteryName}`;
}
