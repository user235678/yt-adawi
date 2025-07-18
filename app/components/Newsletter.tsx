export default function Newsletter() {
  return (
    <section className="bg-gray-100 px-6 py-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="flex items-center mb-6">
            <svg className="w-8 h-8 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-bold text-black">Abonnez-vous à la newsletter</h2>
          </div>

          <form className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
              <div className="md:w-1/3">
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full border-adawi-gold bg-slate-50 text-black px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold"
                />
              </div>

              <div className="md:w-1/2">
                <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full bg-slate-50 text-black px-4 py-2 border border-adawi-gold rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold"
                />
              </div>

              <div className="md:w-auto flex-shrink-0">
                <button
                  type="submit"
                  className="bg-adawi-gold hover:bg-adawi-gold/90 text-white rounded-full font-medium transition-colors flex items-center justify-center h-[42px] w-[42px] shadow-md hover:shadow-lg"
                  aria-label="S'abonner à la newsletter"
                >
                  <svg
                    className="w-6 h-6 transform rotate-[30deg]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className=" w-'45' h-45  ">
          <img
            src="/template/10.png"
            alt="Vêtements suspendus dans un dressing"
            className="w-3/4 h-1/4 object-cover"
          />
        </div>
      </div>
    </section>
  );
}
