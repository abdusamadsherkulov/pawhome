import {House, MessageCircle, Search} from 'lucide-react';

const steps = [
  {icon: Search, title: 'Browse', text: 'Search pets by type, age and city to find a match.'},
  {icon: MessageCircle, title: 'Get in touch', text: 'Contact the owner directly and ask your questions.'},
  {icon: House, title: 'Welcome home', text: 'Meet your new friend and give them a loving home.'},
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-extrabold md:text-3xl">How it works</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-3xl bg-sand p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold">
              {i + 1}. {s.title}
            </h3>
            <p className="mt-1 text-muted">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}