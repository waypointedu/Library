import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Accessibility } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AccessibilityMenu({ user, userPrefs, lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(userPrefs?.high_contrast_mode || false);
  const [textToSpeech, setTextToSpeech] = useState(userPrefs?.text_to_speech || false);
  const [fontSize, setFontSize] = useState('normal');

  const queryClient = useQueryClient();

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  const updatePrefsMutation = useMutation({
    mutationFn: async (data) => {
      if (userPrefs?.id) {
        return base44.entities.UserPreferences.update(userPrefs.id, data);
      } else {
        return base44.entities.UserPreferences.create({
          user_email: user.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrefs', user?.email] });
    }
  });

  const handleHighContrast = (enabled) => {
    setHighContrast(enabled);
    updatePrefsMutation.mutate({ high_contrast_mode: enabled });
  };

  const handleTTS = (enabled) => {
    setTextToSpeech(enabled);
    updatePrefsMutation.mutate({ text_to_speech: enabled });
  };

  const text = {
    en: { title: 'Accessibility', highContrast: 'High Contrast', textToSpeech: 'Text to Speech', fontSize: 'Font Size', small: 'Small', normal: 'Normal', large: 'Large' },
    es: { title: 'Accesibilidad', highContrast: 'Alto Contraste', textToSpeech: 'Texto a Voz', fontSize: 'Tamaño de Fuente', small: 'Pequeño', normal: 'Normal', large: 'Grande' }
  };
  const t = text[lang] || text.en;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.title}
      >
        <Accessibility className="w-5 h-5" />
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-10 w-64 z-50 shadow-lg">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">{t.title}</h3>

            <div className="flex items-center justify-between">
              <span className="text-sm">{t.highContrast}</span>
              <Switch checked={highContrast} onCheckedChange={handleHighContrast} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">{t.textToSpeech}</span>
              <Switch checked={textToSpeech} onCheckedChange={handleTTS} />
            </div>

            <div>
              <p className="text-sm mb-2">{t.fontSize}</p>
              <div className="flex gap-1">
                {['small', 'normal', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${fontSize === size ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    {t[size]}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}