import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full py-4 px-6 md:px-10 bg-white border-b border-honey/20 fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-11 h-11 rounded-full bg-honey flex items-center justify-center">
            <img src="/bee.png" alt="BuzzDetect Logo" className="w-8 h-8" />
          </div>
          <span className="text-2xl font-bold text-hive">
            Buzz<span className="text-honey">Detect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-hive hover:text-honey font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            to="/results"
            className="text-hive hover:text-honey font-medium transition-colors"
          >
            Results
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-hive hover:text-honey transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-honey/20 shadow-lg">
          <nav className="flex flex-col py-4">
            <Link
              to="/"
              className="px-6 py-3 text-hive hover:text-honey hover:bg-honey/5 font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/results"
              className="px-6 py-3 text-hive hover:text-honey hover:bg-honey/5 font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Results
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
