# Focus NFe - Setup no projeto

## 1) Executar estrutura fiscal no banco
Rode o SQL de scripts/002_fiscal_focus_nfe.sql no Supabase SQL Editor.

## 2) Cadastrar configuracao da empresa emissora
Insira 1 registro em fiscal_company_settings com os dados reais da empresa.
Campos minimos para emitir:
- company_name
- cnpj
- regime_tributario
- address_street
- address_number
- address_district
- address_city
- address_city_ibge
- address_state
- address_zip_code
- ambiente (homologacao ou producao)
- focus_token
- focus_api_url

## 3) Endpoints criados
- POST /api/fiscal/emit
- GET /api/fiscal/status/{reference}?document_type=nfce|nfe
- POST /api/fiscal/webhook

## 4) Emitir documento
Payload para POST /api/fiscal/emit:
```json
{
  "sale_id": "UUID_DA_VENDA",
  "document_type": "nfce"
}
```

document_type:
- nfce -> cupom fiscal
- nfe -> nota fiscal eletronica (DANFE)

## 5) Consultar status
Use GET /api/fiscal/status/{reference}?document_type=nfce

## 6) Webhook na Focus
Configure webhook para:
- https://SEU_DOMINIO/api/fiscal/webhook

## 7) Observacoes importantes
- A emissao real depende de certificado digital valido no ambiente Focus.
- NF-e exige cliente com dados completos (CPF/CNPJ e endereco).
- Os itens estao com CFOP/NCM padrao no codigo e devem ser ajustados com o contador.
