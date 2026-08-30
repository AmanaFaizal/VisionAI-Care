import Head from "next/head";
import Link from "next/link";
import LandingNavbar from "../components/LandingNavbar";
import { Eye, Droplet, Zap, Sun, Plus, CheckCircle, ChevronDown, ChevronUp, Stethoscope } from "lucide-react";
import { useState } from "react";

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-200 py-4 cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-navy text-lg">{question}</h4>
        {isOpen ? <ChevronUp className="text-brandOrange" /> : <ChevronDown className="text-brandOrange" />}
      </div>
      {isOpen && <p className="text-gray-600 mt-2">{answer}</p>}
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    { q: "Is the online vision test accurate?", a: "Yes, our online test provides a reliable estimate of your visual acuity. However, it is not a replacement for a comprehensive eye exam by an optometrist." },
    { q: "How long does an eye test take?", a: "The visual acuity test usually takes less than 5 minutes to complete." },
    { q: "Do I need any special equipment?", a: "Just your computer, a webcam (for distance measurement), and enough space to sit a few feet away from your screen." },
    { q: "What should I do if I fail the test?", a: "If your results indicate potential vision issues, we recommend booking an online consultation with one of our certified doctors." },
    { q: "Can children take the online eye test?", a: "Yes, children can take the test with adult supervision." },
    { q: "How often should I test my vision?", a: "It is recommended to test your vision annually or whenever you notice a change in your eyesight." },
    { q: "Is my data secure?", a: "Yes, your test results and personal information are securely encrypted and protected." },
  ];

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Head>
        <title>VisionAI-Care | Test Your Eyes Online</title>
      </Head>

      <LandingNavbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-orange-100 text-brandOrange font-semibold px-4 py-1.5 rounded-full text-sm mb-6">
            VisionAI-Care Online Platform
          </span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-navy leading-tight mb-6">
            Test Your Eyes<br />Online in<br />Minutes
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Whether you need a quick eye exam, a prescription check, or just want to monitor your eye health, our fast and interactive platform makes vision testing easy from home.
          </p>
          <div className="flex gap-4">
            <Link href="/patient/test" className="btn !bg-brandOrange !px-8 !py-3 !rounded-full text-lg shadow-md hover:!bg-orange-600 transition">
              Take The Test
            </Link>
            <Link href="#how-it-works" className="btn !bg-white !text-navy border border-gray-300 !px-8 !py-3 !rounded-full text-lg shadow-sm hover:!bg-gray-50 transition">
              Learn More
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative">
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 flex flex-col items-center justify-center aspect-square md:aspect-auto md:h-[500px]">
            <img
              src="/hero-illustration.png"
              alt="Hero Illustration"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback if image isn't added yet */}
            <div className="bg-blue-50 w-full h-full rounded-2xl hidden flex-col items-center justify-center text-center p-8 border-2 border-dashed border-blue-200">
              <Eye size={64} className="text-blue-300 mb-4" />
              <p className="text-gray-500 font-medium">Add 'hero-illustration.png' to public folder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Logos Bar */}
      <div className="bg-beige border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-8 flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-navy font-semibold">
            <CheckCircle className="text-brandOrange" size={20} /> Over 500,000 users tested
          </div>
          <div className="flex items-center gap-2 text-navy font-semibold">
            <CheckCircle className="text-brandOrange" size={20} /> AI-Powered Accuracy
          </div>
          <div className="flex items-center gap-2 text-navy font-semibold">
            <CheckCircle className="text-brandOrange" size={20} /> Clinically Validated Methods
          </div>
        </div>
      </div>

      {/* Tests Grid Section */}
      <section id="tests" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-serif font-bold text-navy mb-4">Choose Your Online Eye Test</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            We offer various tests to assess different aspects of your vision. Choose the one that best suits your needs or take them all for a complete evaluation.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Visual Acuity */}
            <div className="bg-cardBlue rounded-2xl p-6 text-left flex flex-col h-full border border-blue-100 hover:shadow-lg transition">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Eye className="text-blue-500" />
              </div>
              <h3 className="font-serif font-bold text-navy text-xl mb-3">Visual Acuity Test</h3>
              <p className="text-gray-700 text-sm mb-6 flex-grow">
                Measures how clearly you can see from a distance. Ideal for checking general sharpness and if you need glasses.
              </p>
              <Link href="/patient/test?type=acuity" className="text-brandOrange font-semibold hover:underline mt-auto">
                Take the Test →
              </Link>
            </div>

            {/* Color Blindness */}
            <div className="bg-cardPeach rounded-2xl p-6 text-left flex flex-col h-full border border-orange-100 hover:shadow-lg transition">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Droplet className="text-orange-500" />
              </div>
              <h3 className="font-serif font-bold text-navy text-xl mb-3">Color Blindness Test</h3>
              <p className="text-gray-700 text-sm mb-6 flex-grow">
                Uses the Ishihara plates to check your ability to distinguish between different colors and identify color deficiencies.
              </p>
              <Link href="/patient/test?type=color" className="text-brandOrange font-semibold hover:underline mt-auto">
                Take the Test →
              </Link>
            </div>

            {/* Astigmatism */}
            <div className="bg-cardMint rounded-2xl p-6 text-left flex flex-col h-full border border-green-100 hover:shadow-lg transition">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Zap className="text-green-500" />
              </div>
              <h3 className="font-serif font-bold text-navy text-xl mb-3">Astigmatism Test</h3>
              <p className="text-gray-700 text-sm mb-6 flex-grow">
                Assesses if your cornea is irregularly shaped, which can cause blurry or distorted vision at all distances.
              </p>
              <Link href="/patient/test?type=astigmatism" className="text-brandOrange font-semibold hover:underline mt-auto">
                Take the Test →
              </Link>
            </div>

            {/* Contrast */}
            <div className="bg-cardGray rounded-2xl p-6 text-left flex flex-col h-full border border-gray-200 hover:shadow-lg transition">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Sun className="text-gray-500" />
              </div>
              <h3 className="font-serif font-bold text-navy text-xl mb-3">Contrast Sensitivity</h3>
              <p className="text-gray-700 text-sm mb-6 flex-grow">
                Checks your ability to distinguish between objects and their backgrounds, important for night driving and reading.
              </p>
              <Link href="/patient/test?type=contrast" className="text-brandOrange font-semibold hover:underline mt-auto">
                Take the Test →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Chart Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-8 text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-navy mb-4">Interactive Snellen Eye Chart</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience our digital adaptation of the classic Snellen chart, designed for accurate home testing using advanced AI distance calibration.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center px-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 text-center">
            <h3 className="font-serif font-bold text-3xl text-navy mb-8">E</h3>
            <div className="space-y-4">
              <p className="text-4xl font-bold tracking-[0.5em] text-navy">F P</p>
              <p className="text-3xl font-bold tracking-[0.4em] text-navy">T O Z</p>
              <p className="text-2xl font-bold tracking-[0.3em] text-navy">L P E D</p>
              <p className="text-xl font-bold tracking-[0.2em] text-navy">P E C F D</p>
              <p className="text-lg font-bold tracking-[0.1em] text-navy">E D F C Z P</p>
            </div>
          </div>

          <div>
            <span className="text-brandOrange font-bold text-sm tracking-widest uppercase mb-2 block">Interactive Tool</span>
            <h2 className="text-3xl font-serif font-bold text-navy mb-6">Simulate Your Examination</h2>
            <p className="text-gray-600 mb-8">
              Our interactive chart adjusts automatically based on your distance from the screen. We use your webcam strictly for measuring distance to ensure clinical accuracy.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-beige p-4 rounded-xl border border-orange-100">
                <p className="text-sm text-gray-500 font-semibold mb-1">Target Distance</p>
                <p className="text-xl font-bold text-navy">2.0 meters</p>
              </div>
              <div className="bg-beige p-4 rounded-xl border border-orange-100">
                <p className="text-sm text-gray-500 font-semibold mb-1">Current Distance</p>
                <p className="text-xl font-bold text-brandOrange">--</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
              <p className="text-sm text-blue-800 font-medium flex items-start gap-2">
                <Eye size={16} className="mt-0.5 shrink-0" />
                Distance calibration is active. Please position yourself correctly before beginning.
              </p>
            </div>

            <Link href="/patient/test" className="btn !bg-brandOrange !px-8 !py-3 !rounded-full hover:!bg-orange-600 transition w-full text-center text-lg shadow-md">
              Start The Simulator
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-beige border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-brandOrange font-bold text-sm tracking-widest uppercase mb-2 block">Comprehensive Care</span>
            <h2 className="text-4xl font-serif font-bold text-navy mb-6">Your Complete Online Eye Test, Made Simple</h2>
            <p className="text-gray-600 mb-8">
              Experience professional-grade vision assessment from the comfort of your home. Our platform combines traditional optometry methods with advanced AI to deliver accurate, immediate results.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <CheckCircle className="text-brandOrange shrink-0 mt-1" size={20} />
                <p className="text-gray-700"><strong>Instant AI Feedback:</strong> Get immediate analysis of your visual performance.</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="text-brandOrange shrink-0 mt-1" size={20} />
                <p className="text-gray-700"><strong>Doctor Consultations:</strong> Easily share results with our certified professionals.</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="text-brandOrange shrink-0 mt-1" size={20} />
                <p className="text-gray-700"><strong>Track Your Progress:</strong> Maintain a secure history of your vision health over time.</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="text-brandOrange shrink-0 mt-1" size={20} />
                <p className="text-gray-700"><strong>Family Friendly:</strong> Suitable for monitoring the vision of both adults and children.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-2 md:p-4 shadow-xl border border-gray-100 flex items-center justify-center">
              <img 
                src="/image2.jpg" 
                alt="Patient Dashboard" 
                className="w-full h-auto rounded-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback if image isn't added yet */}
              <div className="bg-orange-50 w-full aspect-video rounded-2xl hidden flex-col items-center justify-center text-center p-8 border-2 border-dashed border-orange-200">
                <CheckCircle size={64} className="text-orange-300 mb-4" />
                <p className="text-gray-500 font-medium">Add 'image2.jpg' to public folder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-serif font-bold text-navy mb-4">How Our Online Vision Test Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16">
            Four simple steps to understand your eye health and get professional guidance.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-left">
              <div className="text-brandOrange font-bold text-lg mb-4">01</div>
              <h4 className="font-serif font-bold text-navy text-xl mb-3">Prepare</h4>
              <p className="text-gray-600 text-sm">Ensure good lighting and allow camera access for distance calibration.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-left">
              <div className="text-brandOrange font-bold text-lg mb-4">02</div>
              <h4 className="font-serif font-bold text-navy text-xl mb-3">Test</h4>
              <p className="text-gray-600 text-sm">Follow the on-screen prompts to read the letters or identify the patterns.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-left">
              <div className="text-brandOrange font-bold text-lg mb-4">03</div>
              <h4 className="font-serif font-bold text-navy text-xl mb-3">Get Results</h4>
              <p className="text-gray-600 text-sm">Receive an instant AI-powered assessment of your visual acuity.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-left">
              <div className="text-brandOrange font-bold text-lg mb-4">04</div>
              <h4 className="font-serif font-bold text-navy text-xl mb-3">Consult</h4>
              <p className="text-gray-600 text-sm">Book a video consultation with our specialists if further care is needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Education / Text Block */}
      <section className="py-20 bg-beige border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-navy mb-6">Your Guide to Vision Issues and Results</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Understanding your eyesight is the first step to maintaining long-term visual health. Our online platform simplifies complex optometry terms, providing you with clear, actionable insights into conditions like myopia, hyperopia, astigmatism, and presbyopia.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By combining advanced diagnostic algorithms with expert medical oversight, we ensure that you are fully informed about your eye health status and the best steps forward.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-4xl font-serif font-bold text-navy mb-12 text-center">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              />
            ))}
          </div>

          {/* Important Note */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mt-12">
            <h4 className="text-red-800 font-bold mb-2">Important Note</h4>
            <p className="text-red-700 text-sm">
              Our online vision assessments are designed to provide a preliminary evaluation of your eyesight and cannot replace a comprehensive in-person eye examination. Please consult an eye care professional for medical diagnoses, prescriptions, and treatment of eye diseases.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-navy text-center">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">Ready to Check Your Vision?</h2>
          <p className="text-gray-300 mb-10 text-lg">
            Join hundreds of thousands of users who trust our advanced platform for quick and reliable vision screening.
          </p>
          <Link href="/patient/test" className="btn !bg-brandOrange !px-10 !py-4 !rounded-full text-lg shadow-lg hover:!bg-orange-600 transition">
            Start Your Free Test →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy border-t border-gray-800 pt-16 pb-8 text-gray-400 text-sm">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-serif font-bold text-xl text-white mb-4">
              <Stethoscope className="text-brandOrange" size={24} />
              VisionAI-Care
            </div>
            <p className="max-w-sm mb-6">
              The modern way to test, monitor, and understand your eye health from the comfort of your home.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="#tests" className="hover:text-brandOrange">Available Tests</Link></li>
              <li><Link href="#how-it-works" className="hover:text-brandOrange">How it Works</Link></li>
              <li><Link href="/login" className="hover:text-brandOrange">Patient Login</Link></li>
              <li><Link href="/login" className="hover:text-brandOrange">Doctor Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-brandOrange">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-brandOrange">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-brandOrange">Medical Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} VisionAI-Care. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Designed for CodeSplash '26</p>
        </div>
      </footer>
    </div>
  );
}
