import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "pt" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Navigation
    dashboard: "Dashboard",
    tickets: "Tickets",
    customers: "Clientes",
    sla: "SLAs",
    timeTracking: "Tempo",
    reports: "Relatórios",
    knowledgeBase: "Base Conhecimento",
    
    // Common
    loading: "Carregando...",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    create: "Criar",
    search: "Buscar",
    
    // Customer Management
    customerManagement: "Gestão de Clientes",
    newCustomer: "Novo Cliente",
    companyName: "Nome da Empresa",
    email: "E-mail",
    phone: "Telefone",
    slaLevel: "Nível SLA",
    status: "Status",
    hourlyRate: "Taxa Horária",
    hourBank: "Banco de Horas",
    active: "Ativo",
    inactive: "Inativo",
    
    // SLA Levels
    bronze: "Bronze",
    silver: "Prata", 
    gold: "Ouro",
    
    // Ticket Management
    ticketManagement: "Gestão de Tickets",
    newTicket: "Novo Ticket",
    title: "Título",
    description: "Descrição",
    priority: "Prioridade",
    type: "Tipo",
    assignee: "Responsável",
    customer: "Cliente",
    
    // Priority Levels
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
    
    // Ticket Status
    open: "Aberto",
    inProgress: "Em Andamento",
    waitingCustomer: "Aguardando Cliente",
    resolved: "Resolvido",
    closed: "Fechado",
    
    // Ticket Types
    support: "Suporte",
    incident: "Incidente",
    optimization: "Otimização",
    featureRequest: "Solicitação de Funcionalidade",
    
    // Gamification
    gamification: "Gamificação",
    leaderboard: "Ranking",
    points: "Pontos",
    badges: "Emblemas",
    achievements: "Conquistas",
    monthlyChallenge: "Desafio Mensal",
    teamGoals: "Metas da Equipe",
    
    // Dashboard
    welcomeMessage: "Bem-vindo ao GeckoStream",
    totalTickets: "Total de Tickets",
    openTickets: "Tickets Abertos",
    resolvedTickets: "Tickets Resolvidos",
    avgResponseTime: "Tempo Médio de Resposta",
    
    // Time Tracking
    startTimer: "Iniciar Timer",
    stopTimer: "Parar Timer",
    timeSpent: "Tempo Gasto",
    totalTime: "Tempo Total",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    tickets: "Tickets",
    customers: "Customers",
    sla: "SLAs",
    timeTracking: "Time Tracking",
    reports: "Reports",
    knowledgeBase: "Knowledge Base",
    
    // Common
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    
    // Customer Management
    customerManagement: "Customer Management",
    newCustomer: "New Customer",
    companyName: "Company Name",
    email: "Email",
    phone: "Phone",
    slaLevel: "SLA Level",
    status: "Status",
    hourlyRate: "Hourly Rate",
    hourBank: "Hour Bank",
    active: "Active",
    inactive: "Inactive",
    
    // SLA Levels
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    
    // Ticket Management
    ticketManagement: "Ticket Management",
    newTicket: "New Ticket",
    title: "Title",
    description: "Description",
    priority: "Priority",
    type: "Type",
    assignee: "Assignee",
    customer: "Customer",
    
    // Priority Levels
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    
    // Ticket Status
    open: "Open",
    inProgress: "In Progress",
    waitingCustomer: "Waiting for Customer",
    resolved: "Resolved",
    closed: "Closed",
    
    // Ticket Types
    support: "Support",
    incident: "Incident",
    optimization: "Optimization",
    featureRequest: "Feature Request",
    
    // Gamification
    leaderboard: "Leaderboard",
    points: "Points",
    badges: "Badges",
    achievements: "Achievements",
    monthlyChallenge: "Monthly Challenge",
    teamGoals: "Team Goals",
  },
  es: {
    // Navigation
    dashboard: "Panel",
    tickets: "Tickets",
    customers: "Clientes",
    sla: "SLAs",
    timeTracking: "Tiempo",
    reports: "Informes",
    knowledgeBase: "Base de Conocimiento",
    
    // Common
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    
    // Customer Management
    customerManagement: "Gestión de Clientes",
    newCustomer: "Nuevo Cliente",
    companyName: "Nombre de la Empresa",
    email: "Correo",
    phone: "Teléfono",
    slaLevel: "Nivel SLA",
    status: "Estado",
    hourlyRate: "Tarifa por Hora",
    hourBank: "Banco de Horas",
    active: "Activo",
    inactive: "Inactivo",
    
    // SLA Levels
    bronze: "Bronce",
    silver: "Plata",
    gold: "Oro",
    
    // Ticket Management
    ticketManagement: "Gestión de Tickets",
    newTicket: "Nuevo Ticket",
    title: "Título",
    description: "Descripción",
    priority: "Prioridad",
    type: "Tipo",
    assignee: "Asignado",
    customer: "Cliente",
    
    // Priority Levels
    low: "Baja",
    medium: "Media",
    high: "Alta",
    critical: "Crítica",
    
    // Ticket Status
    open: "Abierto",
    inProgress: "En Progreso",
    waitingCustomer: "Esperando Cliente",
    resolved: "Resuelto",
    closed: "Cerrado",
    
    // Ticket Types
    support: "Soporte",
    incident: "Incidente",
    optimization: "Optimización",
    featureRequest: "Solicitud de Función",
    
    // Gamification
    leaderboard: "Clasificación",
    points: "Puntos",
    badges: "Insignias",
    achievements: "Logros",
    monthlyChallenge: "Desafío Mensual",
    teamGoals: "Objetivos del Equipo",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("geckostream-language");
    return (stored as Language) || "pt";
  });

  useEffect(() => {
    localStorage.setItem("geckostream-language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}