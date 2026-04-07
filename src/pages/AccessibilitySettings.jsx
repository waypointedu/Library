import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Eye, Volume2, Keyboard, RotateCcw } from "lucide-react";

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState({
    fontSizeMode: 'normal',
    highContrast: false,
    dyslexiaFriendlyFont: false,
    screenReaderOptimized: false,
    keyboardNavigationGuide: false,
    textToSpeechEnabled: false,
    focusIndicatorSize: 3,
    colorBlindMode: 'none'
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
    const saved = localStorage.getItem('accessibility_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (newSettings) => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', newSettings.fontSizeMode);
    if (newSettings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    if (newSettings.dyslexiaFriendlyFont) {
      document.body.style.fontFamily = "'OpenDyslexic', sans-serif";
    } else {
      document.body.style.fontFamily = 'inherit';
    }
    root.style.setProperty('--focus-outline-width', `${newSettings.focusIndicatorSize}px`);
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('accessibility_settings', JSON.stringify(newSettings));
  };

  const handleReset = () => {
    const defaultSettings = {
      fontSizeMode: 'normal', highContrast: false, dyslexiaFriendlyFont: false,
      screenReaderOptimized: false, keyboardNavigationGuide: false,
      textToSpeechEnabled: false, focusIndicatorSize: 3, colorBlindMode: 'none'
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem('accessibility_settings', JSON.stringify(defaultSettings));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Accessibility Settings</h1>
        <p className="text-slate-600 mb-6">Customize your experience to better suit your needs</p>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4" /> Display & Vision</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Font Size</p>
                <Select value={settings.fontSizeMode} onValueChange={val => handleSettingChange('fontSizeMode', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (14px)</SelectItem>
                    <SelectItem value="normal">Normal (16px)</SelectItem>
                    <SelectItem value="large">Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={settings.highContrast} onCheckedChange={e => handleSettingChange('highContrast', e)} />
                <span className="text-sm">High Contrast Mode</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={settings.dyslexiaFriendlyFont} onCheckedChange={e => handleSettingChange('dyslexiaFriendlyFont', e)} />
                <span className="text-sm">Dyslexia-Friendly Font</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Volume2 className="w-4 h-4" /> Audio & Screen Reader</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox checked={settings.textToSpeechEnabled} onCheckedChange={e => handleSettingChange('textToSpeechEnabled', e)} />
                <span className="text-sm">Enable Text-to-Speech</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={settings.screenReaderOptimized} onCheckedChange={e => handleSettingChange('screenReaderOptimized', e)} />
                <span className="text-sm">Optimize for Screen Readers</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset to Default
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}