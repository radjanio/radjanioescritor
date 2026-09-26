# Configuração do Supabase — Radjanio Silva Souza

Este projeto foi construído para integração nativa com o **Supabase** (PostgreSQL, Authentication, Row Level Security e Storage).

## 1. Passo a Passo de Conexão

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Acesse o **SQL Editor** do Supabase (`SQL Editor` -> `New Query`).
3. Abra o arquivo `supabase/schema.sql` deste projeto (ou copie diretamente da aba **Supabase & SQL** no painel administrativo `/admin`).
4. Cole o conteúdo no SQL Editor do Supabase e clique em **Run**.
   - Isso criará todas as 8 tabelas (`books`, `book_stages`, `projects`, `updates`, `texts`, `timeline`, `gallery`, `site_settings`).
   - Habilitará as políticas de **Row Level Security (RLS)** para proteção dos dados.
   - Criará o bucket de Storage `author-assets` para upload de capas e fotografias.
5. No painel do Supabase, vá em **Project Settings** -> **API**:
   - Copie o **Project URL**
   - Copie a **Anon Public Key**
6. No site, acesse `/admin` (ou `/admin/login`), vá na aba **Supabase & SQL**, insira as credenciais e clique em **Salvar e Conectar**. Você também pode defini-las no arquivo `.env` com as variáveis:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

## 2. Acesso Administrativo Inicial

- **URL de Login**: `/admin/login`
- **E-mail inicial**: `radjaniokk@gmail.com`
- **Senha inicial**: `admin123` (ou a senha configurada no Supabase Auth).

## 3. Dados de Demonstração (Conformidade com a Regra 27)

Para testar o layout sem inventar conteúdos falsos como se fossem do autor:
- O site inicia com **estados vazios elegantes** caso nada esteja cadastrado.
- No painel administrativo há o botão **"Carregar Exemplos"**, que preenche livros e textos claramente identificados com a etiqueta `[Exemplo]`.
- Quando desejar limpar, basta clicar em **"Limpar Exemplos"** no Dashboard para retornar ao acervo limpo.
