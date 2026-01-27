# Localização dos Dropdowns - Cadastro de Veículos

## 📍 Marca → Modelo → Tipo (encadeados)

O formulário de novo veículo e o modal de edição estão em [templates/veiculos.html](templates/veiculos.html). As três entradas funcionam juntas e utilizam os dados enviados pelo backend via `marcas` (constante `VEICULO_MARCAS`).

### Marca

- **Bloco HTML (novo veículo):** linhas iniciais do formulário.

```html
<label class="field-marca">
    <span>Marca</span>
    <select name="marca" id="vehicleBrand" required>
        <option value="">Selecione a marca...</option>
        {% for marca in marcas %}
            <option value="{{ marca.label }}">{{ marca.label }}</option>
        {% endfor %}
    </select>
</label>
```

- **Bloco HTML (modal de edição):** mesmo markup com os ids `editVehicleMarca` / `editVehicleModelo` / `editVehicleTipo*`.
- **Fonte dos dados:** `VEICULO_MARCAS` em [app.py](app.py#L74-L150). Cada marca possui `id`, `label` e uma lista `models`.

### Modelo

- Renderizado dinamicamente; começa desabilitado até que uma marca seja escolhida.
- Cada `option` adicionada em tempo real carrega `data-model-id` e `data-tipo-id`, permitindo identificar o tipo correspondente.
- JS responsável: função `setupBrandModelType` no final de [templates/veiculos.html](templates/veiculos.html#L138-L260). Ela cria controladores para o formulário de criação (`vehicleBrand/vehicleModel/...`) e para o modal de edição (`editVehicleMarca/...`).

### Tipo

- Campo não editável manualmente. O label visível (`vehicleTypeLabel` / `editVehicleTipoLabel`) mostra o texto do tipo e o valor real é armazenado nos `input type="hidden"` `vehicleTypeValue` / `editVehicleTipoValue`.
- O tipo vem do `tipo_id` definido em cada modelo dentro de `VEICULO_MARCAS`. A função `updateType` atualiza ambos os inputs sempre que o modelo muda.
- Lista de labels usada para exibir o nome amigável fica em `VEICULO_TIPOS` ([app.py](app.py#L56-L70)).

Caso um veículo existente tenha marca/modelo fora da lista, o modal de edição mostra um fallback: mantém o campo de modelo em branco e preenche o tipo com a string salva no banco (trecho tratado no mesmo script JS citado acima).

## ⛽ Combustível

- Campo permanece independente, tanto no formulário quanto no modal.
- HTML (novo veículo):

```html
<label>
    <span>Combustível</span>
    <select name="combustivel" required>
        <option value="">Combustível</option>
        {% for combustivel in combustiveis %}
            <option value="{{ combustivel.id }}">{{ combustivel.label }}</option>
        {% endfor %}
    </select>
</label>
```

- Constante `VEICULO_COMBUSTIVEIS` ([app.py](app.py#L63-L70)) abastece tanto `combustiveis` no template quanto o script que seta o valor no modal (`editVehicleCombustivel`).

## 🧠 Fluxo do JavaScript

1. `const VEHICLE_BRANDS = {{ marcas | tojson }}` traz `VEICULO_MARCAS` para o browser.
2. `setupBrandModelType` recebe os elementos (`brandSelect`, `modelSelect`, `typeLabelInput`, `typeValueInput`) e:
   - Faz o binding dos eventos `change` em marca/modelo;
   - Popular o select de modelos conforme a marca escolhida;
   - Sincroniza o tipo sempre que um modelo válido é selecionado;
   - Exposto via `createBrandController` (form principal) e `editBrandController` (modal) para que possamos chamar `populate(marca, modelo)` na abertura do modal.

## 🔧 Como atualizar as opções

1. **Adicionar/editar marcas/modelos/tipos:** atualize `VEICULO_MARCAS` e, se necessário, `VEICULO_TIPOS` em [app.py](app.py#L56-L150).
   - Cada modelo precisa de um `tipo_id` que exista em `VEICULO_TIPOS`.
2. **Atualizar combustíveis:** edite `VEICULO_COMBUSTIVEIS` no mesmo arquivo.
3. Reinicie o servidor Flask (ou recarregue) para que as listas sejam reenviadas ao template.

## 📋 Backend

- **Criar veículo:** rota `POST /admin/veiculos` em [app.py](app.py#L530-L575) recebe `placa`, `modelo`, `marca`, `tipo`, `combustivel` e salva em `veiculo`.
- **Editar via modal (AJAX):** rota `POST /admin/veiculos/<id>/edit` em [app.py](app.py#L595-L635) valida os mesmos campos e atualiza a linha correspondente.
- **Exclusão:** rota `DELETE /admin/veiculos/<id>/delete` em [app.py](app.py#L637-L653) remove registro e fotos do bucket.

## 💾 Banco de dados

- Tabela `veiculo` armazena as colunas usadas pelos dropdowns:
  - `marca`: texto exibido na UI (label da marca).
  - `modelo`: texto exibido na UI.
  - `tipo`: id definido em `VEICULO_TIPOS` (ajustado automaticamente conforme o modelo).
  - `combustivel`: id definido em `VEICULO_COMBUSTIVEIS`.
- A página `/admin/veiculos` também enriquece os registros exibidos mapeando novamente para `VEICULO_MARCAS`, garantindo consistência entre banco e dropdowns.# Localização dos Dropdowns - Página de Cadastro de Veículos

## 📍 Onde os Dropdowns estão no código:

### 1. **DROPDOWN: Tipo de Veículo**

**Arquivo:** [templates/veiculos.html](templates/veiculos.html)

**Linhas no formulário de novo veículo:** ~23-30
```html
<!-- DROPDOWN: Tipo de Veículo -->
<label>
    <span>Tipo</span>
    <select name="tipo" required>
        <option value="">Selecione o tipo...</option>
        {% for tipo in tipos %}
            <option value="{{ tipo.id }}">{{ tipo.label }}</option>
        {% endfor %}
    </select>
</label>
```

**Linhas no formulário de edição:** ~74-82 (dentro da seção vehicle-fields)

**Constantes definidas em:** [app.py](app.py) - Linhas ~92-99
```python
VEICULO_TIPOS = [
    {"id": "automovel", "label": "Automóvel"},
    {"id": "caminhonete", "label": "Caminhonete"},
    {"id": "suv", "label": "SUV"},
    {"id": "van", "label": "Van"},
    {"id": "caminhao", "label": "Caminhão"},
    {"id": "onibus", "label": "Ônibus"},
    {"id": "moto", "label": "Moto"},
]
```

---

### 2. **DROPDOWN: Combustível**

**Arquivo:** [templates/veiculos.html](templates/veiculos.html)

**Linhas no formulário de novo veículo:** ~31-38
```html
<!-- DROPDOWN: Combustível -->
<label>
    <span>Combustível</span>
    <select name="combustivel" required>
        <option value="">Selecione o combustível...</option>
        {% for combustivel in combustiveis %}
            <option value="{{ combustivel.id }}">{{ combustivel.label }}</option>
        {% endfor %}
    </select>
</label>
```

**Linhas no formulário de edição:** ~83-91 (dentro da seção vehicle-fields)

**Constantes definidas em:** [app.py](app.py) - Linhas ~101-107
```python
VEICULO_COMBUSTIVEIS = [
    {"id": "gasolina", "label": "Gasolina"},
    {"id": "diesel", "label": "Diesel"},
    {"id": "etanol", "label": "Etanol"},
    {"id": "flex", "label": "Flex"},
    {"id": "eletrico", "label": "Elétrico"},
    {"id": "hibrido", "label": "Híbrido"},
    {"id": "gnv", "label": "GNV"},
]
```

---

## 🔧 Como atualizar as opções dos dropdowns:

1. Edite as constantes `VEICULO_TIPOS` ou `VEICULO_COMBUSTIVEIS` em [app.py](app.py)
2. As mudanças aparecerão automaticamente nos formulários de novo cadastro e edição

## 📋 Backend:

- **Rota POST (novo veículo):** [app.py](app.py) - Linha ~530 (`/admin/veiculos`)
- **Rota POST (editar veículo):** [app.py](app.py) - Linha ~573 (`/admin/veiculos/<veiculo_id>`)
- Ambas as rotas recebem os campos `tipo` e `combustivel` do formulário

## 💾 Banco de dados:

Os valores são salvos na tabela `veiculo` com as colunas:
- `tipo` - id do dropdown VEICULO_TIPOS (ex: "automovel", "suv", "caminhao")
- `combustivel` - id do dropdown VEICULO_COMBUSTIVEIS (ex: "gasolina", "diesel", "eletrico")
