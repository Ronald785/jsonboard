# JSONBoard

## Descrição

**JSONBoard** é uma aplicação web client-side em **React + TypeScript** para gerenciamento de arquivos JSON de até 450 MB. Ideal para desenvolvedores e usuários que trabalham com grandes volumes de dados, permite upload, edição inline, organização em pastas e sincronização em tempo real entre abas — tudo com persistência local via IndexedDB.

---

## 🚀 Instalação

### Pré-requisitos

- [Git + Git Bash](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Node](https://nodejs.org/pt)

```sh
git clone https://github.com/Ronald785/jsonboard
cd jsonboard
npm install
npm run dev
```

Acesse em: [http://localhost:5173/](http://localhost:5173/)

---

## 👨‍💻 Uso

1. Faça o upload de arquivos `.json`
2. Organize em pastas e subpastas
3. Edite os campos diretamente na interface
4. Veja o JSON bruto e copie, se necessário
5. Abra múltiplas abas e experimente a sincronização em tempo real

---

## ✅ Módulos da Aplicação

### 📁 Módulo 1 – Upload e Visualização

- [x] Upload de arquivos `.json` de diferentes tamanhos
- [x] Validação de JSON com mensagem de erro em caso de arquivo inválido
- [x] Parsing assíncrono (não bloqueia a thread principal)
- [x] Barra de progresso:

    - [x] Upload
    - [x] Parsing

- [x] Visualização dos dados:

    - [x] Em tabela/lista com **virtualização**
    - [x] Edição inline:

        - [x] Clique para editar
        - [x] Confirmação ao perder foco ou pressionar Enter

- [x] Visualização RAW:

    - [x] Modal dedicado
    - [x] Botão para copiar JSON para a área de transferência

### 🗂️ Módulo 2 – Gerenciamento de Hierarquia

- [x] Criar, renomear e excluir pastas
- [x] Estrutura em árvore para navegação
- [x] Associação de arquivos JSON a entradas na árvore
- [x] Mover arquivos/pastas entre diretórios
- [x] Persistência local:

    - [x] Salvar edições no IndexedDB
    - [x] Persistir estrutura de pastas
    - [x] Restaurar automaticamente ao reabrir a aplicação

### 🔄 Módulo 3 – Sincronização em Tempo Real

- [x] Edições refletidas em tempo real entre abas (via `BroadcastChannel`)
- [x] Indicação visual de alterações feitas em outra aba
- [x] Resolução de conflitos: a última escrita vence, com notificação ao usuário

---

## 🧩 Bônus e Desafios Técnicos

### Desafios Técnicos Enfrentados

- **Grandes Arquivos JSON**

    - Upload com **FileReader** para mostrar progresso
    - Parsing com **Web Workers** para evitar bloqueios na UI
    - Limite prático de 512 MB, devido ao carregamento completo em memória
    - Alternativas exploradas:

        - Streaming com `clarinet` ou `oboe.js`. Essas soluções não foram implementadas pois a aplicação tem como foco ser 100% client-side e a infraestrutura utilizada (Vercel serverless) não comporta processamentos intensivos ou streams prolongadas

- **Persistência de Dados**

    - Armazenamento local com **IndexedDB** via **Dexie.js**
    - Evita as limitações de 2–5 MB do `localStorage`

- **Virtualização de Listas**

    - Para garantir desempenho na visualização de grandes arquivos JSON, foram testadas diversas bibliotecas voltadas à renderização de estruturas de dados (como `react-json-view`, `react-json-tree`, entre outras).
    - No entanto, **nenhuma oferecia suporte eficiente à virtualização** ou carregamento otimizado para arquivos de grande porte.
    - Diante disso, foi adotada uma **solução personalizada**, implementando um sistema próprio de **carregamento incremental**: os dados são renderizados em pacotes de 50 entradas por vez conforme o usuário rola a página.
    - Isso garante fluidez na interface mesmo com milhares de registros, evitando o carregamento completo do JSON na renderização inicial.

- **Estrutura de Pastas Otimizada**

    - Implementação com interfaces:

        - `Folder`, `FileEntry`, `FileContent`

    - Navegação sem carregar o JSON completo, apenas metadados e referências

- **Sincronização Local**

    - Edições propagadas em tempo real entre abas abertas
    - Conflitos tratados com base no `contentId` e notificação visual

---

## ⚙️ Tecnologias Utilizadas

- **React 18**
- **TypeScript**
- **Zustand** – estado global enxuto e direto
- **Dexie.js** – wrapper para IndexedDB
- **Tailwind CSS** – estilização rápida e consistente
- **Vite** – bundler e ambiente de desenvolvimento
- **ESLint**, **Prettier** e **EditorConfig** – padronização e qualidade de código

---

## ✍️ Autor

<img src="https://avatars.githubusercontent.com/u/65602274?v=4" width="100px;" alt=""/>

Contate-me:

[![Linkedin Badge](https://img.shields.io/badge/-Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/ronald785/)](https://www.linkedin.com/in/ronald785/)
[![Gmail Badge](https://img.shields.io/badge/-Gmail-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:ronaldmateus785@gmail.com)](mailto:ronaldmateus785@gmail.com)
