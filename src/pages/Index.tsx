import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { Course } from '@/components/dashboard/types';
import { mockCourses, mockQuizQuestions, mockVoiceSteps, mockAchievements, mockLeaderboard, mockKnowledgeBase } from '@/components/dashboard/mockData';
import TrainerDialogs from '@/components/dashboard/TrainerDialogs';
import CourseDialog from '@/components/dashboard/CourseDialog';
import LearningStats from '@/components/dashboard/LearningStats';
import VoiceRecorder from '@/lib/voiceRecorder';
import SpeechAnalyzer, { SpeechAnalysisResult } from '@/lib/speechAnalyzer';
import PatientAI, { ConversationAnalysis } from '@/lib/patientAI';
import { useToast } from '@/hooks/use-toast';
import AdminSimulatorDialog from '@/components/simulator/AdminSimulatorDialog';
import SalesBattle from '@/components/games/SalesBattle';
import DashboardHeader from './Index/DashboardHeader';
import DashboardContent from './Index/DashboardContent';
import KnowledgeBase from './Index/KnowledgeBase';
import ProfileContent from './Index/ProfileContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { CustomScenario } from '@/types/customScenario';
import { ScenarioStorage } from '@/lib/scenarioStorage';
import ScenarioList from '@/components/custom-scenarios/ScenarioList';
import ScenarioEditor from '@/components/custom-scenarios/ScenarioEditor';
import CustomDoctorDialog from '@/components/custom-scenarios/CustomDoctorDialog';

export default function Index() {
  const navigate = useNavigate();
  const currentUser = authService.getUser();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourseCategory, setSelectedCourseCategory] = useState<string | null>(null);
  
  const [quizDialog, setQuizDialog] = useState(false);
  const [voiceDialog, setVoiceDialog] = useState(false);
  const [doctorDialog, setDoctorDialog] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentVoiceStep, setCurrentVoiceStep] = useState(0);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<SpeechAnalysisResult | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [voiceStream, setVoiceStream] = useState<MediaStream | null>(null);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const speechAnalyzerRef = useRef<SpeechAnalyzer>(new SpeechAnalyzer());
  const { toast } = useToast();
  const [doctorScenario, setDoctorScenario] = useState<'consultation' | 'treatment' | 'emergency' | 'objections'>('consultation');
  const [doctorMessages, setDoctorMessages] = useState<Array<{ role: 'admin' | 'patient', content: string }>>([]);
  const [doctorInput, setDoctorInput] = useState('');
  const [conversationAnalysis, setConversationAnalysis] = useState<ConversationAnalysis | null>(null);
  const [isDoctorRecording, setIsDoctorRecording] = useState(false);
  const [doctorRecordingStartTime, setDoctorRecordingStartTime] = useState<number>(0);
  const [doctorVoiceStream, setDoctorVoiceStream] = useState<MediaStream | null>(null);
  const patientAIRef = useRef<PatientAI | null>(null);
  const doctorVoiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const [learningStatsKey, setLearningStatsKey] = useState(0);
  const [simulatorDialog, setSimulatorDialog] = useState(false);
  const [salesBattleDialog, setSalesBattleDialog] = useState(false);
  
  const [selectedKnowledgeCategory, setSelectedKnowledgeCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleContent, setNewArticleContent] = useState('');
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
  const [selectedKnowledgeTag, setSelectedKnowledgeTag] = useState<string | null>(null);

  const [customScenariosDialog, setCustomScenariosDialog] = useState(false);
  const [customScenarioEditorDialog, setCustomScenarioEditorDialog] = useState(false);
  const [selectedCustomScenario, setSelectedCustomScenario] = useState<any>(null);
  const [customDoctorDialog, setCustomDoctorDialog] = useState(false);
  const [playingCustomScenario, setPlayingCustomScenario] = useState<any>(null);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getStatusBadge = (status: Course['status']) => {
    const variants = {
      'not-started': { variant: 'secondary' as const, text: 'Не начат' },
      'in-progress': { variant: 'default' as const, text: 'В процессе' },
      'completed': { variant: 'outline' as const, text: 'Завершён' }
    };
    return variants[status];
  };

  const handleCompleteLesson = (courseId: number, lessonId: number) => {
    console.log(`Completing lesson ${lessonId} in course ${courseId}`);
  };

  const handleSubmitQuiz = () => {
    const correct = quizAnswers.filter((answer, index) => answer === mockQuizQuestions[index].correctAnswer).length;
    const score = Math.round((correct / mockQuizQuestions.length) * 100);
    setQuizScore(score);
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizQuestion < mockQuizQuestions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevQuizQuestion = () => {
    if (currentQuizQuestion > 0) {
      setCurrentQuizQuestion(currentQuizQuestion - 1);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizQuestion(0);
    setQuizAnswers([]);
    setQuizScore(null);
  };

  const handleNextVoiceStep = () => {
    if (currentVoiceStep < mockVoiceSteps.length - 1) {
      setCurrentVoiceStep(currentVoiceStep + 1);
      setVoiceResponse('');
    } else {
      setVoiceDialog(false);
      setCurrentVoiceStep(0);
      setVoiceResponse('');
    }
  };

  const handleStartRecording = async () => {
    if (!voiceRecorderRef.current) {
      voiceRecorderRef.current = new VoiceRecorder({
        onTranscript: (text) => {
          setVoiceResponse(text);
        },
        onError: (error) => {
          console.warn('Voice recording error:', error);
        },
      });
    }

    if (!voiceRecorderRef.current.isSupported()) {
      toast({
        title: 'Запись не поддерживается',
        description: 'Ваш браузер не поддерживает запись аудио',
        variant: 'destructive',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setVoiceStream(stream);
      
      await voiceRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setVoiceResponse('');
      setVoiceAnalysis(null);
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      
      let description = 'Не удалось получить доступ к микрофону';
      if (error.name === 'NotAllowedError') {
        description = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.';
      } else if (error.name === 'NotFoundError') {
        description = 'Микрофон не найден. Подключите микрофон и попробуйте снова.';
      }
      
      toast({
        title: 'Ошибка доступа к микрофону',
        description,
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = () => {
    if (voiceRecorderRef.current && isRecording) {
      voiceRecorderRef.current.stopRecording();
      setIsRecording(false);
      
      if (voiceStream) {
        voiceStream.getTracks().forEach(track => track.stop());
        setVoiceStream(null);
      }

      const duration = (Date.now() - recordingStartTime) / 1000;
      const analysis = speechAnalyzerRef.current.analyze(voiceResponse, duration);
      setVoiceAnalysis(analysis);
    }
  };

  const handleStartDoctorDialog = (scenario: typeof doctorScenario) => {
    setDoctorScenario(scenario);
    setDoctorMessages([]);
    setDoctorInput('');
    setConversationAnalysis(null);
    
    patientAIRef.current = new PatientAI(scenario);
    const greeting = patientAIRef.current.getGreeting();
    setDoctorMessages([{ role: 'patient', content: greeting }]);
    
    setDoctorDialog(true);
  };

  const handleSendDoctorMessage = async (message: string) => {
    if (!message.trim() || !patientAIRef.current) return;

    setDoctorMessages(prev => [...prev, { role: 'admin', content: message }]);
    setDoctorInput('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = patientAIRef.current.generateResponse(message);
    setDoctorMessages(prev => [...prev, { role: 'patient', content: response.message }]);
  };

  const handleStartDoctorRecording = async () => {
    if (!doctorVoiceRecorderRef.current) {
      doctorVoiceRecorderRef.current = new VoiceRecorder({
        onTranscript: (text) => {
          setDoctorInput(text);
        },
        onError: (error) => {
          console.warn('Voice recording error:', error);
        },
      });
    }

    if (!doctorVoiceRecorderRef.current.isSupported()) {
      toast({
        title: 'Запись не поддерживается',
        description: 'Ваш браузер не поддерживает запись аудио',
        variant: 'destructive',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setDoctorVoiceStream(stream);
      
      await doctorVoiceRecorderRef.current.startRecording();
      setIsDoctorRecording(true);
      setDoctorRecordingStartTime(Date.now());
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      
      let description = 'Не удалось получить доступ к микрофону';
      if (error.name === 'NotAllowedError') {
        description = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.';
      } else if (error.name === 'NotFoundError') {
        description = 'Микрофон не найден. Подключите микрофон и попробуйте снова.';
      }
      
      toast({
        title: 'Ошибка доступа к микрофону',
        description,
        variant: 'destructive',
      });
    }
  };

  const handleStopDoctorRecording = () => {
    if (doctorVoiceRecorderRef.current && isDoctorRecording) {
      doctorVoiceRecorderRef.current.stopRecording();
      setIsDoctorRecording(false);
      
      if (doctorVoiceStream) {
        doctorVoiceStream.getTracks().forEach(track => track.stop());
        setDoctorVoiceStream(null);
      }
    }
  };

  const handleEndDoctorConversation = () => {
    if (!patientAIRef.current) return;
    
    const analysis = patientAIRef.current.analyzeConversation();
    setConversationAnalysis(analysis);
    setLearningStatsKey(prev => prev + 1);
  };

  const handleCloseDoctorDialog = (open: boolean) => {
    if (!open) {
      setDoctorMessages([]);
      setDoctorInput('');
      setConversationAnalysis(null);
      patientAIRef.current = null;
    }
    setDoctorDialog(open);
  };

  const handleStartTraining = (type: 'quiz' | 'voice' | 'doctor') => {
    if (type === 'quiz') {
      setQuizDialog(true);
      setCurrentQuizQuestion(0);
      setQuizAnswers([]);
      setQuizScore(null);
    } else if (type === 'voice') {
      setVoiceDialog(true);
      setCurrentVoiceStep(0);
      setVoiceResponse('');
      setVoiceAnalysis(null);
    } else if (type === 'doctor') {
      handleStartDoctorDialog('consultation');
    }
  };

  const handleSaveCategory = () => {
    console.log('Saving category:', { name: newCategoryName, description: newCategoryDescription });
    setIsCreatingCategory(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    toast({
      title: 'Категория создана',
      description: 'Новая категория успешно добавлена',
    });
  };

  const handleSaveArticle = () => {
    console.log('Saving article:', { title: newArticleTitle, content: newArticleContent });
    setIsCreatingArticle(false);
    setNewArticleTitle('');
    setNewArticleContent('');
    toast({
      title: 'Статья опубликована',
      description: 'Новая статья успешно добавлена в базу знаний',
    });
  };

  const handleOpenCustomScenarios = () => {
    setCustomScenariosDialog(true);
  };

  const handleCreateCustomScenario = () => {
    setSelectedCustomScenario(null);
    setCustomScenarioEditorDialog(true);
  };

  const handleEditCustomScenario = (scenario: CustomScenario) => {
    setSelectedCustomScenario(scenario);
    setCustomScenarioEditorDialog(true);
  };

  const handleSaveCustomScenario = (scenario: CustomScenario) => {
    ScenarioStorage.save(scenario);
    setCustomScenarioEditorDialog(false);
    setSelectedCustomScenario(null);
    toast({
      title: 'Сценарий сохранён',
      description: `Сценарий "${scenario.name}" успешно сохранён`,
    });
  };

  const handlePlayCustomScenario = (scenario: CustomScenario) => {
    setPlayingCustomScenario(scenario);
    setCustomScenariosDialog(false);
    setCustomDoctorDialog(true);
  };

  const handleCloseCustomDoctor = () => {
    setCustomDoctorDialog(false);
    setPlayingCustomScenario(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateToAdmin={() => navigate('/admin')}
      />

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Главная</TabsTrigger>
            <TabsTrigger value="knowledge">База знаний</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="profile">Профиль</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardContent
              courses={mockCourses}
              achievements={mockAchievements}
              leaderboard={mockLeaderboard}
              selectedCourseCategory={selectedCourseCategory}
              onCategorySelect={setSelectedCourseCategory}
              onCourseClick={setSelectedCourse}
              onStartTraining={handleStartTraining}
              onOpenSimulator={() => setSimulatorDialog(true)}
              onOpenSalesBattle={() => setSalesBattleDialog(true)}
              onOpenCustomScenarios={handleOpenCustomScenarios}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeBase
              knowledgeCategories={mockKnowledgeBase}
              selectedKnowledgeCategory={selectedKnowledgeCategory}
              onCategorySelect={setSelectedKnowledgeCategory}
              selectedArticle={selectedArticle}
              onArticleSelect={setSelectedArticle}
              onBackToList={() => setSelectedArticle(null)}
              isCreatingCategory={isCreatingCategory}
              onCreateCategoryToggle={() => setIsCreatingCategory(!isCreatingCategory)}
              newCategoryName={newCategoryName}
              onCategoryNameChange={setNewCategoryName}
              newCategoryDescription={newCategoryDescription}
              onCategoryDescriptionChange={setNewCategoryDescription}
              onSaveCategory={handleSaveCategory}
              isCreatingArticle={isCreatingArticle}
              onCreateArticleToggle={() => setIsCreatingArticle(!isCreatingArticle)}
              newArticleTitle={newArticleTitle}
              onArticleTitleChange={setNewArticleTitle}
              newArticleContent={newArticleContent}
              onArticleContentChange={setNewArticleContent}
              onSaveArticle={handleSaveArticle}
              knowledgeSearchQuery={knowledgeSearchQuery}
              onSearchQueryChange={setKnowledgeSearchQuery}
              selectedKnowledgeTag={selectedKnowledgeTag}
              onTagSelect={setSelectedKnowledgeTag}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <LearningStats key={learningStatsKey} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileContent currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </main>

      <CourseDialog
        course={selectedCourse}
        open={!!selectedCourse}
        onOpenChange={(open) => !open && setSelectedCourse(null)}
        onCompleteLesson={handleCompleteLesson}
      />

      <TrainerDialogs
        quizDialog={quizDialog}
        voiceDialog={voiceDialog}
        doctorDialog={doctorDialog}
        onQuizDialogChange={setQuizDialog}
        onVoiceDialogChange={setVoiceDialog}
        onDoctorDialogChange={handleCloseDoctorDialog}
        currentQuizQuestion={currentQuizQuestion}
        quizAnswers={quizAnswers}
        quizScore={quizScore}
        currentVoiceStep={currentVoiceStep}
        voiceResponse={voiceResponse}
        isRecording={isRecording}
        voiceAnalysis={voiceAnalysis}
        voiceStream={voiceStream}
        doctorScenario={doctorScenario}
        doctorMessages={doctorMessages}
        doctorInput={doctorInput}
        conversationAnalysis={conversationAnalysis}
        isDoctorRecording={isDoctorRecording}
        doctorVoiceStream={doctorVoiceStream}
        onQuizAnswer={handleQuizAnswer}
        onNextQuizQuestion={handleNextQuizQuestion}
        onPrevQuizQuestion={handlePrevQuizQuestion}
        onRestartQuiz={handleRestartQuiz}
        onNextVoiceStep={handleNextVoiceStep}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onDoctorScenarioChange={setDoctorScenario}
        onDoctorInputChange={setDoctorInput}
        onSendDoctorMessage={handleSendDoctorMessage}
        onStartDoctorRecording={handleStartDoctorRecording}
        onStopDoctorRecording={handleStopDoctorRecording}
        onEndDoctorConversation={handleEndDoctorConversation}
      />

      <AdminSimulatorDialog
        open={simulatorDialog}
        onOpenChange={setSimulatorDialog}
      />

      <Dialog open={salesBattleDialog} onOpenChange={setSalesBattleDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <SalesBattle />
        </DialogContent>
      </Dialog>

      <Dialog open={customScenariosDialog} onOpenChange={setCustomScenariosDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <Icon name="Layers" size={28} className="text-primary" />
              Конструктор сценариев
            </DialogTitle>
            <DialogDescription>
              Создавайте собственных ИИ-пациентов для практики
            </DialogDescription>
          </DialogHeader>
          <ScenarioList
            onEdit={handleEditCustomScenario}
            onPlay={handlePlayCustomScenario}
            onCreateNew={handleCreateCustomScenario}
            onRefresh={() => {}}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={customScenarioEditorDialog} onOpenChange={setCustomScenarioEditorDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomScenario ? 'Редактировать сценарий' : 'Создать новый сценарий'}
            </DialogTitle>
            <DialogDescription>
              Настройте контекст, характер и поведение ИИ-пациента
            </DialogDescription>
          </DialogHeader>
          <ScenarioEditor
            scenario={selectedCustomScenario}
            onSave={handleSaveCustomScenario}
            onCancel={() => {
              setCustomScenarioEditorDialog(false);
              setSelectedCustomScenario(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <CustomDoctorDialog
        scenario={playingCustomScenario}
        open={customDoctorDialog}
        onClose={handleCloseCustomDoctor}
      />
    </div>
  );
}