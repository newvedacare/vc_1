"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqData = {
  "Hair Care": [
    {
      question: "How often should I apply the hair oil?",
      answer: "For best results, apply the hair oil 2-3 times per week. Massage it gently into your scalp and leave it on for at least 30 minutes before washing."
    },
    {
      question: "Can I use it for post-pregnancy hair fall?",
      answer: "Yes, our hair oil is specially formulated to be safe and effective for post-pregnancy hair fall. It contains natural ingredients that help strengthen hair follicles."
    },
    {
      question: "How long until I see results?",
      answer: "Most users start seeing results within 4-6 weeks of regular use. For best results, use consistently as part of your hair care routine."
    }
  ],
  "Pain Relief": [
    {
      question: "Is it safe for daily use?",
      answer: "Yes, our pain relief oil is safe for daily use. However, we recommend following the recommended dosage and consulting with a healthcare provider for chronic conditions."
    },
    {
      question: "How quickly does it work?",
      answer: "Most users experience relief within 15-30 minutes of application. The duration of relief can vary based on the condition and severity."
    },
    {
      question: "Can it be used for arthritis pain?",
      answer: "Yes, our pain relief oil is effective for arthritis pain. The Ayurvedic formulation helps reduce inflammation and provides long-lasting relief."
    }
  ],
  "Memory Booster": [
    {
      question: "Is it suitable for children?",
      answer: "Yes, our Memory Booster Oil is safe for children above 5 years of age. We recommend consulting with a pediatrician before use."
    },
    {
      question: "What is the best time to apply?",
      answer: "For optimal results, apply the Memory Booster Oil before bedtime. This allows for better absorption during sleep."
    },
    {
      question: "How long should I use it for?",
      answer: "For best results, use consistently for at least 3-4 months. Results may vary based on individual conditions."
    }
  ],
  "Return & Exchange": [
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unopened products. Opened products can be returned within 14 days if they cause any adverse reactions."
    },
    {
      question: "How do I initiate a return?",
      answer: "To initiate a return, contact our customer service team with your order number. We'll guide you through the process and provide a return shipping label."
    },
    {
      question: "What is the refund processing time?",
      answer: "Refunds are typically processed within 5-7 business days after we receive the returned product. The amount will be credited to your original payment method."
    }
  ]
};

export function FAQSection() {
  const [activeTab, setActiveTab] = useState("Hair Care");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-orange-500 text-4xl">?</span>
          <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
        </div>
        <p className="text-gray-600 text-center mb-12">Find answers to common questions about our products</p>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            {Object.keys(faqData).map((category) => (
              <Tabs.Trigger
                key={category}
                value={category}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  "hover:text-black",
                  activeTab === category ? "bg-white text-black shadow" : "text-gray-600"
                )}
              >
                {category}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {Object.entries(faqData).map(([category, questions]) => (
            <Tabs.Content key={category} value={category}>
              <Accordion.Root type="single" collapsible className="space-y-4">
                {questions.map((faq, index) => (
                  <Accordion.Item
                    key={index}
                    value={`item-${index}`}
                    className="bg-white border rounded-lg overflow-hidden"
                  >
                    <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-4 text-left">
                      <span className="text-gray-900 font-medium">{faq.question}</span>
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                    <Accordion.Content className="px-6 py-4 text-gray-600 text-sm bg-gray-50">
                      {faq.answer}
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
}
