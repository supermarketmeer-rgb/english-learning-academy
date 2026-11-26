import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AcademyProvider } from './context/AcademyContext';
import { AudioLabPage } from './pages/AudioLabPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamsModulePage } from './pages/ExamsModulePage';
import { GrammarModulePage } from './pages/GrammarModulePage';
import { HomePage } from './pages/HomePage';
import { LearningPathPage } from './pages/LearningPathPage';
import { ListeningModulePage } from './pages/ListeningModulePage';
import { ModulesHubPage } from './pages/ModulesHubPage';
import { PlacementTestPage } from './pages/PlacementTestPage';
import { ProfilesSettingsPage } from './pages/ProfilesSettingsPage';
import { ReadingModulePage } from './pages/ReadingModulePage';
import { SpeakingModulePage } from './pages/SpeakingModulePage';
import { VocabularyModulePage } from './pages/VocabularyModulePage';
import { WritingModulePage } from './pages/WritingModulePage';

export default function App() {
  return (
    <AcademyProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/placement" element={<PlacementTestPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/modules" element={<ModulesHubPage />} />
            <Route path="/modules/vocabulary" element={<VocabularyModulePage />} />
            <Route path="/modules/grammar" element={<GrammarModulePage />} />
            <Route path="/modules/reading" element={<ReadingModulePage />} />
            <Route path="/modules/listening" element={<ListeningModulePage />} />
            <Route path="/modules/speaking" element={<SpeakingModulePage />} />
            <Route path="/modules/writing" element={<WritingModulePage />} />
            <Route path="/modules/exams" element={<ExamsModulePage />} />
            <Route path="/audio-lab" element={<AudioLabPage />} />
            <Route path="/profiles" element={<ProfilesSettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AcademyProvider>
  );
}
