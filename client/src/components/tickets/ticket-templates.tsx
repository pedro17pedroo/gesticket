import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileTextIcon, 
  ComputerIcon, 
  WifiIcon, 
  MailIcon, 
  PhoneIcon,
  SettingsIcon,
  AlertTriangleIcon,
  HelpCircleIcon,
  PlusIcon
} from "lucide-react";

interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  priority: string;
  type: string;
  titleTemplate: string;
  descriptionTemplate: string;
  tags: string[];
  icon: any;
  color: string;
}

const TICKET_TEMPLATES: TicketTemplate[] = [
  {
    id: "hardware-computer",
    name: "Problema no Computador",
    description: "Para problemas com hardware do computador",
    category: "hardware",
    subcategory: "Computador",
    priority: "medium",
    type: "incident",
    titleTemplate: "Problema no computador - [Descreva brevemente]",
    descriptionTemplate: `**Tipo de problema:**
- [ ] Não liga
- [ ] Tela azul/travamento
- [ ] Lentidão
- [ ] Barulho estranho
- [ ] Outro: _______

**Quando o problema começou:**

**O que estava fazendo quando o problema ocorreu:**

**Mensagens de erro (se houver):**

**Já tentou reiniciar o computador?**
- [ ] Sim
- [ ] Não`,
    tags: ["hardware", "computador", "suporte"],
    icon: ComputerIcon,
    color: "bg-blue-500"
  },
  {
    id: "network-connection",
    name: "Problema de Rede/Internet",
    description: "Para problemas de conectividade",
    category: "hardware",
    subcategory: "Rede",
    priority: "high",
    type: "incident",
    titleTemplate: "Sem conexão com a internet - [Local/Setor]",
    descriptionTemplate: `**Tipo de problema:**
- [ ] Sem internet
- [ ] Internet lenta
- [ ] Não consegue acessar sites específicos
- [ ] WiFi não aparece
- [ ] Outro: _______

**Equipamentos afetados:**
- [ ] Computador
- [ ] Notebook
- [ ] Celular
- [ ] Todos os dispositivos

**Local/Setor afetado:**

**Outros usuários relataram o mesmo problema?**
- [ ] Sim
- [ ] Não
- [ ] Não sei

**Horário que o problema começou:**`,
    tags: ["rede", "internet", "conectividade"],
    icon: WifiIcon,
    color: "bg-green-500"
  },
  {
    id: "email-issue",
    name: "Problema no Email",
    description: "Para problemas com email e Outlook",
    category: "email",
    subcategory: "Outlook",
    priority: "medium",
    type: "support",
    titleTemplate: "Problema no email - [Tipo do problema]",
    descriptionTemplate: `**Tipo de problema:**
- [ ] Não consegue enviar emails
- [ ] Não está recebendo emails
- [ ] Erro ao abrir o Outlook
- [ ] Emails indo para spam
- [ ] Caixa de entrada cheia
- [ ] Configuração de email novo
- [ ] Outro: _______

**Mensagem de erro (se houver):**

**Desde quando o problema ocorre:**

**Consegue acessar email pelo navegador (webmail)?**
- [ ] Sim
- [ ] Não
- [ ] Não tentei

**Email(s) afetado(s):**`,
    tags: ["email", "outlook", "comunicação"],
    icon: MailIcon,
    color: "bg-purple-500"
  },
  {
    id: "software-install",
    name: "Instalação de Software",
    description: "Para solicitações de instalação de programas",
    category: "software",
    subcategory: "Aplicativo",
    priority: "low",
    type: "feature_request",
    titleTemplate: "Solicitação de instalação - [Nome do software]",
    descriptionTemplate: `**Software solicitado:**

**Versão específica (se aplicável):**

**Motivo da solicitação:**

**Urgência:**
- [ ] Urgente (trabalho parado)
- [ ] Necessário esta semana
- [ ] Quando possível

**Outros usuários precisam do mesmo software?**
- [ ] Sim, quem: _______
- [ ] Não
- [ ] Não sei

**Licença:**
- [ ] Já temos licença
- [ ] Precisamos comprar
- [ ] Software gratuito
- [ ] Não sei

**Justificativa de negócio:**`,
    tags: ["software", "instalação", "aplicativo"],
    icon: SettingsIcon,
    color: "bg-orange-500"
  },
  {
    id: "phone-issue",
    name: "Problema Telefônico",
    description: "Para problemas com telefone e ramais",
    category: "telefonia",
    subcategory: "Telefone Fixo",
    priority: "high",
    type: "incident",
    titleTemplate: "Problema no telefone - Ramal [número]",
    descriptionTemplate: `**Tipo de problema:**
- [ ] Sem linha/sem tom
- [ ] Não consegue fazer ligações
- [ ] Não recebe ligações
- [ ] Qualidade ruim (chiado, eco)
- [ ] Ramal não funciona
- [ ] Outro: _______

**Ramal afetado:**

**Telefone/aparelho afetado:**

**O problema afeta:**
- [ ] Ligações internas
- [ ] Ligações externas
- [ ] Ambas

**Desde quando o problema ocorre:**

**Outros ramais próximos funcionam normalmente?**
- [ ] Sim
- [ ] Não
- [ ] Não sei`,
    tags: ["telefonia", "ramal", "comunicação"],
    icon: PhoneIcon,
    color: "bg-red-500"
  },
  {
    id: "access-permission",
    name: "Solicitação de Acesso",
    description: "Para solicitações de permissões e acessos",
    category: "acesso",
    subcategory: "Permissões",
    priority: "medium",
    type: "feature_request",
    titleTemplate: "Solicitação de acesso - [Sistema/Recurso]",
    descriptionTemplate: `**Acesso solicitado para:**
- [ ] Sistema/aplicativo: _______
- [ ] Pasta compartilhada: _______
- [ ] Impressora: _______
- [ ] VPN
- [ ] Email/grupo
- [ ] Outro: _______

**Nome do usuário:**

**Justificativa/motivo:**

**Tipo de permissão necessária:**
- [ ] Leitura apenas
- [ ] Leitura e escrita
- [ ] Administrador
- [ ] Específica: _______

**Aprovação do gestor:**
- [ ] Já aprovado por: _______
- [ ] Pendente de aprovação

**Urgência:**
- [ ] Urgente (não consegue trabalhar)
- [ ] Necessário esta semana
- [ ] Quando possível

**Acesso temporário ou permanente?**
- [ ] Permanente
- [ ] Temporário até: _______`,
    tags: ["acesso", "permissões", "segurança"],
    icon: AlertTriangleIcon,
    color: "bg-yellow-500"
  },
  {
    id: "general-question",
    name: "Dúvida Geral",
    description: "Para dúvidas e questões gerais de TI",
    category: "outros",
    subcategory: "Dúvida",
    priority: "low",
    type: "support",
    titleTemplate: "Dúvida sobre [assunto]",
    descriptionTemplate: `**Sua dúvida:**

**Contexto/situação:**

**O que você já tentou:**

**Urgência:**
- [ ] Tenho trabalho parado
- [ ] Preciso saber hoje
- [ ] Quando possível

**Informações adicionais:**`,
    tags: ["dúvida", "suporte", "geral"],
    icon: HelpCircleIcon,
    color: "bg-gray-500"
  }
];

interface TicketTemplatesProps {
  onSelectTemplate: (template: TicketTemplate) => void;
}

export default function TicketTemplates({ onSelectTemplate }: TicketTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "hardware", label: "Hardware" },
    { value: "software", label: "Software" },
    { value: "email", label: "Email" },
    { value: "telefonia", label: "Telefonia" },
    { value: "acesso", label: "Acesso" },
    { value: "outros", label: "Outros" }
  ];

  const filteredTemplates = selectedCategory === "all" 
    ? TICKET_TEMPLATES 
    : TICKET_TEMPLATES.filter(template => template.category === selectedCategory);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileTextIcon className="h-4 w-4 mr-2" />
          Usar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Templates de Tickets</DialogTitle>
          <DialogDescription>
            Escolha um template para acelerar a criação do seu ticket
          </DialogDescription>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(template => {
            const IconComponent = template.icon;
            return (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${template.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.subcategory}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        template.priority === 'critical' ? 'border-red-500 text-red-600' :
                        template.priority === 'high' ? 'border-orange-500 text-orange-600' :
                        template.priority === 'medium' ? 'border-yellow-500 text-yellow-600' :
                        'border-green-500 text-green-600'
                      }`}
                    >
                      {template.priority === 'critical' ? 'Crítica' :
                       template.priority === 'high' ? 'Alta' :
                       template.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map(tag => (
                      <span 
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button 
                    onClick={() => onSelectTemplate(template)}
                    className="w-full"
                    size="sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-gray-500">
              Tente selecionar uma categoria diferente.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}