from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt  # Usar bcrypt diretamente
from jose import JWTError, jwt
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security
SECRET_KEY = os.environ['SECRET_KEY']
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Usar bcrypt diretamente (sem passlib)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ============== CREATE APP ==============
app = FastAPI()

# ============== CORS - DEVE SER ANTES DO ROUTER! ==============
# MUITO IMPORTANTE: O CORS deve ser adicionado ANTES de incluir as rotas
cors_origins_str = os.environ.get('CORS_ORIGINS', '*')

if cors_origins_str == '*':
    cors_origins = ['*']
else:
    cors_origins = [origin.strip() for origin in cors_origins_str.split(',') if origin.strip()]

print(f"🔧 CORS configurado para: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# ============== CREATE ROUTER ==============
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    brand_name: Optional[str] = None
    profile_photo: Optional[str] = None
    push_subscription: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    brand_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    client_id: str
    client_name: Optional[str] = ""
    event_type: str
    event_date: str  # formato ISO: 2025-02-06T14:00:00
    location: str = ""
    status: str = "confirmado"
    total_value: float
    amount_paid: float = 0
    remaining_installments: int = 1
    notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    client_id: str
    event_type: str
    event_date: str  # formato: 2025-02-06T14:00:00
    location: Optional[str] = ""
    total_value: float
    amount_paid: float = 0
    remaining_installments: int = 1
    notes: Optional[str] = ""
    status: str = "confirmado"

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    event_id: str
    installment_number: int
    amount: float
    due_date: str
    paid: bool = False
    paid_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentCreate(BaseModel):
    event_id: str
    installment_number: int
    amount: float
    due_date: str

class Gallery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    event_id: Optional[str] = None
    name: str
    photos_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryCreate(BaseModel):
    event_id: Optional[str] = None
    name: str

class DashboardStats(BaseModel):
    total_clients: int
    total_events: int
    total_revenue: float
    pending_payments: float
    upcoming_events: List[Event]

# ============== PASSWORD RECOVERY MODELS ==============

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

# ============== SUBSCRIPTION MODELS ==============

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan: str = "trial"  # trial, active, cancelled
    price: float = 19.90
    status: str = "active"  # active, cancelled, past_due
    trial_end_date: datetime
    current_period_start: datetime
    current_period_end: datetime
    mercado_pago_subscription_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MercadoPagoWebhook(BaseModel):
    action: str
    api_version: str
    data: dict
    date_created: str
    id: int
    live_mode: bool
    type: str
    user_id: str


# ============== AUTH FUNCTIONS ==============

def verify_password(plain_password, hashed_password):
    """Verifica senha usando bcrypt diretamente"""
    try:
        # Trunca senha em 72 bytes (limite do bcrypt)
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        # Verifica usando bcrypt direto
        return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))
    except Exception as e:
        print(f"❌ Erro ao verificar senha: {e}")
        return False

def get_password_hash(password):
    """Cria hash da senha usando bcrypt diretamente"""
    try:
        # Trunca senha em 72 bytes (limite do bcrypt)
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        # Gera hash usando bcrypt direto
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"❌ Erro ao criar hash de senha: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar senha")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if user_doc is None:
        raise credentials_exception
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        brand_name=user_data.brand_name
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = get_password_hash(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user.email})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user_doc = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    if not verify_password(user_data.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    access_token = create_access_token(data={"sub": user.email})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/push-subscription")
async def save_push_subscription(subscription: dict, current_user: User = Depends(get_current_user)):
    """Salva a subscription de push notifications do usuário"""
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"push_subscription": subscription}}
    )
    return {"message": "Subscription salva com sucesso"}

@api_router.delete("/auth/push-subscription")
async def delete_push_subscription(current_user: User = Depends(get_current_user)):
    """Remove a subscription de push notifications"""
    await db.users.update_one(
        {"id": current_user.id},
        {"$unset": {"push_subscription": ""}}
    )
    return {"message": "Subscription removida com sucesso"}

# ============== PASSWORD RECOVERY ROUTES ==============

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Envia código de recuperação por email
    """
    user_doc = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user_doc:
        # Por segurança, sempre retorna sucesso mesmo se o email não existir
        return {"message": "Se o email existir, você receberá um código de recuperação"}
    
    # Gerar código de 6 dígitos
    reset_code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    # Salvar código no banco
    await db.password_resets.update_one(
        {"email": request.email},
        {
            "$set": {
                "code": reset_code,
                "expires_at": expires_at.isoformat(),
                "used": False
            }
        },
        upsert=True
    )
    
    # Enviar email (em produção, descomentar isso)
    # from email_service import send_reset_code_email
    # send_reset_code_email(request.email, reset_code, user_doc.get('name', 'Usuário'))
    
    # MODO DEBUG - Imprime no console
    print(f"🔑 Código de recuperação para {request.email}: {reset_code}")
    print(f"⏰ Válido até: {expires_at}")
    
    return {"message": "Se o email existir, você receberá um código de recuperação"}

@api_router.post("/auth/verify-reset-code")
async def verify_reset_code(request: VerifyResetCodeRequest):
    """
    Verifica se o código de recuperação é válido
    """
    reset_doc = await db.password_resets.find_one({"email": request.email}, {"_id": 0})
    
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado")
    
    # Verificar se o código está correto
    if reset_doc['code'] != request.code:
        raise HTTPException(status_code=400, detail="Código incorreto")
    
    # Verificar se o código já foi usado
    if reset_doc.get('used', False):
        raise HTTPException(status_code=400, detail="Este código já foi utilizado")
    
    # Verificar se o código expirou
    expires_at = datetime.fromisoformat(reset_doc['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Código expirado. Solicite um novo código.")
    
    return {"message": "Código válido", "email": request.email}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Reseta a senha usando o código de verificação
    """
    # Verificar código novamente
    reset_doc = await db.password_resets.find_one({"email": request.email}, {"_id": 0})
    
    if not reset_doc or reset_doc['code'] != request.code or reset_doc.get('used', False):
        raise HTTPException(status_code=400, detail="Código inválido")
    
    # Verificar expiração
    expires_at = datetime.fromisoformat(reset_doc['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Código expirado")
    
    # Atualizar senha do usuário
    new_password_hash = get_password_hash(request.new_password)
    await db.users.update_one(
        {"email": request.email},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    # Marcar código como usado
    await db.password_resets.update_one(
        {"email": request.email},
        {"$set": {"used": True}}
    )
    
    print(f"✅ Senha resetada com sucesso para {request.email}")
    
    return {"message": "Senha alterada com sucesso! Você já pode fazer login."}

# ============== CLIENT ROUTES ==============

@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate, current_user: User = Depends(get_current_user)):
    client = Client(user_id=current_user.id, **client_data.model_dump())
    doc = client.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.clients.insert_one(doc)
    return client

@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: User = Depends(get_current_user)):
    clients = await db.clients.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    for client in clients:
        if isinstance(client['created_at'], str):
            client['created_at'] = datetime.fromisoformat(client['created_at'])
        # Corrige email vazio salvo pelo chatbot (string vazia não é EmailStr válido)
        if client.get('email') == '' or client.get('email') == 'null':
            client['email'] = None
        if client.get('phone') == '':
            client['phone'] = None
    return clients

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, current_user: User = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id, "user_id": current_user.id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    if isinstance(client['created_at'], str):
        client['created_at'] = datetime.fromisoformat(client['created_at'])
    if client.get('email') == '' or client.get('email') == 'null':
        client['email'] = None
    if client.get('phone') == '':
        client['phone'] = None
    return Client(**client)

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: User = Depends(get_current_user)):
    result = await db.clients.delete_one({"id": client_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return {"message": "Cliente deletado com sucesso"}

# ============== EVENT ROUTES ==============

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    print(f"📝 Criando evento: {event_data.model_dump()}")  # Debug log
    event = Event(user_id=current_user.id, **event_data.model_dump())
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    print(f"✅ Documento a ser inserido: {doc}")  # Debug log
    await db.events.insert_one(doc)
    print(f"✅ Evento criado com sucesso: {event.id}")  # Debug log
    return event

@api_router.get("/events", response_model=List[Event])
async def get_events(current_user: User = Depends(get_current_user)):
    events = await db.events.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    # Buscar todos os clientes de uma vez para performance
    clients = await db.clients.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    clients_map = {c["id"]: c.get("name", "") for c in clients}
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        # Injeta client_name se não estiver salvo
        if not event.get('client_name') and event.get('client_id'):
            event['client_name'] = clients_map.get(event['client_id'], '')
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id, "user_id": current_user.id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    if isinstance(event['created_at'], str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    return Event(**event)

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: EventCreate, current_user: User = Depends(get_current_user)):
    result = await db.events.update_one(
        {"id": event_id, "user_id": current_user.id},
        {"$set": event_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return await get_event(event_id, current_user)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: User = Depends(get_current_user)):
    result = await db.events.delete_one({"id": event_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return {"message": "Evento deletado com sucesso"}

# ============== PAYMENT ROUTES ==============

@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: User = Depends(get_current_user)):
    payment = Payment(user_id=current_user.id, **payment_data.model_dump())
    doc = payment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.payments.insert_one(doc)
    return payment

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(current_user: User = Depends(get_current_user)):
    payments = await db.payments.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    for payment in payments:
        if isinstance(payment['created_at'], str):
            payment['created_at'] = datetime.fromisoformat(payment['created_at'])
    return payments

@api_router.get("/payments/{payment_id}", response_model=Payment)
async def get_payment(payment_id: str, current_user: User = Depends(get_current_user)):
    payment = await db.payments.find_one({"id": payment_id, "user_id": current_user.id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    if isinstance(payment['created_at'], str):
        payment['created_at'] = datetime.fromisoformat(payment['created_at'])
    return Payment(**payment)

@api_router.patch("/payments/{payment_id}/pay")
async def pay_payment(payment_id: str, current_user: User = Depends(get_current_user)):
    result = await db.payments.update_one(
        {"id": payment_id, "user_id": current_user.id},
        {"$set": {"paid": True, "paid_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    
    # Update event amount_paid
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    event_payments = await db.payments.find({"event_id": payment['event_id'], "paid": True}, {"_id": 0}).to_list(1000)
    total_paid = sum(p['amount'] for p in event_payments)
    await db.events.update_one({"id": payment['event_id']}, {"$set": {"amount_paid": total_paid}})
    
    return {"message": "Pagamento marcado como pago"}

@api_router.delete("/payments/{payment_id}")
async def delete_payment(payment_id: str, current_user: User = Depends(get_current_user)):
    result = await db.payments.delete_one({"id": payment_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    return {"message": "Pagamento deletado com sucesso"}

# ============== GALLERY ROUTES ==============

@api_router.post("/galleries", response_model=Gallery)
async def create_gallery(gallery_data: GalleryCreate, current_user: User = Depends(get_current_user)):
    gallery = Gallery(user_id=current_user.id, **gallery_data.model_dump())
    doc = gallery.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.galleries.insert_one(doc)
    return gallery

@api_router.get("/galleries", response_model=List[Gallery])
async def get_galleries(current_user: User = Depends(get_current_user)):
    galleries = await db.galleries.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    for gallery in galleries:
        if isinstance(gallery['created_at'], str):
            gallery['created_at'] = datetime.fromisoformat(gallery['created_at'])
    return galleries

# ============== DASHBOARD ROUTES ==============

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    clients = await db.clients.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    events = await db.events.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    # Calcular receita usando amount_paid dos eventos (não payments collection)
    total_revenue = sum(e.get('amount_paid', 0) for e in events)
    
    # Calcular pagamentos pendentes (total_value - amount_paid)
    pending_payments = sum(e.get('total_value', 0) - e.get('amount_paid', 0) for e in events)
    
    # Get upcoming events (next 5)
    upcoming = sorted(
        [e for e in events if e['status'] in ['confirmado', 'pendente']],
        key=lambda x: x['event_date']
    )[:5]
    
    clients_list = await db.clients.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    clients_map = {c["id"]: c.get("name", "") for c in clients_list}
    for event in upcoming:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if not event.get('client_name') and event.get('client_id'):
            event['client_name'] = clients_map.get(event['client_id'], '')
    
    return DashboardStats(
        total_clients=len(clients),
        total_events=len(events),
        total_revenue=total_revenue,
        pending_payments=pending_payments,
        upcoming_events=upcoming
    )


# ============== AUTO LOGIN / BIOMETRIC ==============

class AutoLoginRequest(BaseModel):
    device_id: str
    token: str  # token salvo no dispositivo

@api_router.post("/auth/auto-login")
async def auto_login(request: AutoLoginRequest):
    """Valida token salvo e retorna dados do usuario para login automatico"""
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        # Gerar novo token renovado
        access_token = create_access_token(data={"sub": user["id"]})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            }
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

# ============== CHAT ASSISTANT ==============

class ChatMessage(BaseModel):
    message: str

def extrair_data(texto):
    import re
    from datetime import date, timedelta
    import unicodedata
    hoje = date.today()
    t = unicodedata.normalize('NFD', texto).encode('ascii','ignore').decode('ascii').lower()
    
    # Amanha
    if 'amanha' in t:
        d = hoje + timedelta(days=1)
        return d.strftime('%Y-%m-%dT09:00:00')
    
    # Proxima semana
    if 'proxima semana' in t or 'semana que vem' in t:
        d = hoje + timedelta(days=7)
        return d.strftime('%Y-%m-%dT09:00:00')
    
    # Proximo mes
    if 'proximo mes' in t or 'mes que vem' in t:
        d = hoje + timedelta(days=30)
        return d.strftime('%Y-%m-%dT09:00:00')
    
    # Extrair hora de qualquer formato: 14h, 14h30, 14:30, as 14, as 14h
    def get_hora(texto_h):
        h = re.search(r'(?:as\s+|as\s+)?(\d{1,2})h(\d{2})?', texto_h)
        if h: return f"{int(h.group(1)):02d}:{h.group(2) or '00'}"
        h = re.search(r'(\d{1,2}):(\d{2})', texto_h)
        if h: return f"{int(h.group(1)):02d}:{h.group(2)}"
        return '09:00'
    
    hora = get_hora(t)
    
    # dd/mm ou dd/mm/yyyy
    m = re.search(r'(\d{1,2})/(\d{1,2})(?:/(\d{2,4}))?', t)
    if m:
        dia, mes = int(m.group(1)), int(m.group(2))
        ano = int(m.group(3)) if m.group(3) else hoje.year
        if ano < 100: ano += 2000
        if 1 <= dia <= 31 and 1 <= mes <= 12:
            try: return f'{ano:04d}-{mes:02d}-{dia:02d}T{hora}:00'
            except: pass
    
    # dia por extenso: "dia 15", "dia quinze"
    numeros_extenso = {
        'um':1,'dois':2,'tres':3,'quatro':4,'cinco':5,'seis':6,'sete':7,'oito':8,
        'nove':9,'dez':10,'onze':11,'doze':12,'treze':13,'quatorze':14,'catorze':14,
        'quinze':15,'dezesseis':16,'dezessete':17,'dezoito':18,'dezenove':19,'vinte':20,
        'vinte e um':21,'vinte e dois':22,'vinte e tres':23,'vinte e quatro':24,
        'vinte e cinco':25,'vinte e seis':26,'vinte e sete':27,'vinte e oito':28,
        'vinte e nove':29,'trinta':30,'trinta e um':31
    }
    
    meses = {
        'janeiro':1,'fevereiro':2,'marco':3,'abril':4,'maio':5,'junho':6,
        'julho':7,'agosto':8,'setembro':9,'outubro':10,'novembro':11,'dezembro':12,
        'jan':1,'fev':2,'mar':3,'abr':4,'mai':5,'jun':6,
        'jul':7,'ago':8,'set':9,'out':10,'nov':11,'dez':12
    }
    
    # Tentar meses por extenso com dia numerico ou por extenso
    for nome_mes, num_mes in meses.items():
        # "23 de maio", "23 maio", "maio 23"
        patterns = [
            rf'(\d{{1,2}})\s*(?:de\s*)?{nome_mes}(?:\s*(?:de\s*)?(\d{{4}}))?',
            rf'{nome_mes}\s*(\d{{1,2}})(?:\s*(?:de\s*)?(\d{{4}}))?',
        ]
        for pat in patterns:
            m = re.search(pat, t)
            if m:
                try:
                    dia = int(m.group(1))
                    ano = int(m.group(2)) if m.group(2) else hoje.year
                    if 1 <= dia <= 31:
                        return f'{ano:04d}-{num_mes:02d}-{dia:02d}T{hora}:00'
                except: pass
        
        # Dia por extenso + mes
        for nome_dia, num_dia in numeros_extenso.items():
            if re.search(rf'{nome_dia}\s*(?:de\s*)?{nome_mes}', t):
                ano = hoje.year
                am = re.search(r'(\d{4})', t)
                if am: ano = int(am.group(1))
                return f'{ano:04d}-{num_mes:02d}-{num_dia:02d}T{hora}:00'
    
    # So dia: "dia 15" (assume mes atual ou proximo)
    m = re.search(r'(?:dia|no dia)\s+(\d{1,2})(?!\s*/)', t)
    if m:
        dia = int(m.group(1))
        mes = hoje.month
        ano = hoje.year
        if dia < hoje.day:  # dia ja passou, assume proximo mes
            mes += 1
            if mes > 12: mes, ano = 1, ano + 1
        if 1 <= dia <= 31:
            return f'{ano:04d}-{mes:02d}-{dia:02d}T{hora}:00'
    
    return None

def extrair_valor(texto):
    import re
    m = re.search(r'r\$\s*([\d.,]+)|valor\s+(?:de\s+)?r?\$?\s*([\d.,]+)|([\d.]+)\s*reais', texto, re.IGNORECASE)
    if m:
        val = (m.group(1) or m.group(2) or m.group(3)).replace('.','').replace(',','.')
        try: return float(val)
        except: pass
    return 0.0

def extrair_nome_cliente(texto_original):
    import re
    # Palavras que nao sao nomes
    stop_words = {'um','uma','novo','nova','o','a','os','as','de','do','da','para','no','na',
                  'event','evento','criar','novo','agendar','marcar','cadastrar','fazer',
                  'casamento','aniversario','ensaio','formatura','festa','batizado','fotografia',
                  'dia','valor','reais','hoje','amanha','janeiro','fevereiro','marco','abril',
                  'maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'}
    
    padroes = [
        # "para o/a Nome Sobrenome"
        r'para\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ]+){0,3})\s*(?:,|\.|casamento|aniversar|ensaio|evento|formatura|infantil|batizado|debutante|\d|valor|no\s+dia|dia\s+\d)',
        # "para o/a Nome" no final ou antes de virgula
        r'para\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ]+){0,3})(?:\s*,|\s*$)',
        # "cliente Nome"  
        r'cliente\s+([A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ]+){0,3})',
        # "do/da/de Nome"
        r'(?:do|da|de)\s+(?:cliente\s+)?([A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ]+){0,3})',
        # generico: qualquer nome proprio no inicio (maiuscula)
        r'para\s+([A-ZÀ-Ÿ][a-zA-ZÀ-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zA-ZÀ-ÿ]+)?)',
    ]
    
    import unicodedata
    def norm_stop(s):
        return unicodedata.normalize('NFD', s).encode('ascii','ignore').decode('ascii').lower().strip()
    
    for p in padroes:
        m = re.search(p, texto_original, re.IGNORECASE)
        if m:
            nome = m.group(1).strip().rstrip(',').strip()
            partes = nome.split()
            # Filtrar stop words
            partes_validas = [w for w in partes if norm_stop(w) not in stop_words and len(w) > 1]
            if partes_validas and len(partes_validas[0]) > 1:
                return ' '.join(partes_validas[:3])
    return None

def extrair_tipo_evento(texto):
    import unicodedata
    t = unicodedata.normalize('NFD', texto).encode('ascii','ignore').decode('ascii').lower()
    tipos = [('casamento','Casamento'),('aniversario','Aniversário'),('ensaio','Ensaio'),
             ('formatura','Formatura'),('debutante','Debutante'),('15 anos','15 Anos'),
             ('infantil','Evento Infantil'),('batizado','Batizado'),('corporativo','Corporativo'),
             ('cha de bebe','Chá de Bebê'),('festa','Festa')]
    for chave, valor in tipos:
        if chave in t: return valor
    return 'Evento'

def norm(texto):
    import unicodedata
    return unicodedata.normalize('NFD', texto).encode('ascii','ignore').decode('ascii').lower().strip()

@api_router.post("/chat")
async def chat_assistant(chat: ChatMessage, current_user: User = Depends(get_current_user)):
    from datetime import datetime as dt
    import re
    
    texto_original = chat.message.strip()
    t = norm(texto_original)
    
    clients = await db.clients.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    events = await db.events.find({"user_id": current_user.id}, {"_id": 0}).to_list(50)
    
    # LISTAR CLIENTES
    if any(w in t for w in ['listar cliente','ver cliente','meus clientes','lista cliente','quais clientes']):
        if not clients:
            return {"action":"answer","message":"Você ainda não tem clientes cadastrados."}
        lista = chr(10).join([f"• {c['name']}" + (f" - {c['phone']}" if c.get('phone') else '') for c in clients])
        return {"action":"list_clients","message":f"Seus clientes ({len(clients)}):{chr(10)}{lista}"}
    
    # LISTAR EVENTOS
    if any(w in t for w in ['listar evento','ver evento','meus eventos','lista evento','quais eventos','proximos eventos']):
        if not events:
            return {"action":"answer","message":"Você ainda não tem eventos cadastrados."}
        lista = chr(10).join([f"• {e['event_type']} - {e['event_date'][:10]}" for e in events[:10]])
        return {"action":"list_events","message":f"Seus eventos ({len(events)}):{chr(10)}{lista}"}
    
    # CRIAR CLIENTE
    if any(w in t for w in ['novo cliente','criar cliente','adicionar cliente','cadastrar cliente']):
        m = re.search(r'cliente\s+([A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+){0,4})', texto_original, re.IGNORECASE)
        nome = m.group(1).strip() if m else None
        if not nome:
            return {"action":"ask","message":"Qual o nome do cliente?"}
        tel_m = re.search(r'(?:tel|fone|cel|whats)[^\d]*([\d\s\-\(\)]{8,15})', texto_original, re.IGNORECASE)
        telefone = re.sub(r'[^\d]', '', tel_m.group(1)) if tel_m else ''
        existe = next((c for c in clients if norm(c['name']) == norm(nome)), None)
        if existe:
            return {"action":"answer","message":f"ℹ️ Cliente {nome} já está cadastrado!"}
        nc = {"id":str(uuid.uuid4()),"user_id":current_user.id,"name":nome,"phone":telefone if telefone else None,
              "email":None,"notes":"","created_at":dt.now(timezone.utc).isoformat()}
        await db.clients.insert_one(nc)
        return {"action":"create_client","message":f"✅ Cliente {nome} cadastrado!" + (f" Tel: {telefone}" if telefone else "")}
    
    # CRIAR EVENTO - detecta por palavras de acao OU por tipo de evento OU por "para [nome]" com data
    tem_tipo = any(w in t for w in ['casamento','aniversar','ensaio','formatura','debutante','infantil','batizado','corporativo','festa','debutant','quinze anos','15 anos','cha de bebe','chá'])
    tem_criar = any(w in t for w in ['criar','novo evento','agendar','cadastrar evento','marcar','registrar','adicionar evento','quero criar','quero agendar','faz um evento','faze um evento'])
    tem_para = bool(__import__('re').search(r'para\s+(?:o\s+|a\s+)?[A-Za-zÀ-ÿ]', texto_original, __import__('re').IGNORECASE))
    tem_data = extrair_data(texto_original) is not None
    tem_valor = extrair_valor(texto_original) > 0
    
    # Ativa se: tem tipo OU tem acao de criar OU (tem "para [nome]" E tem data ou valor)
    if tem_criar or tem_tipo or (tem_para and (tem_data or tem_valor)):
        nome_cliente = extrair_nome_cliente(texto_original)
        data_evento = extrair_data(texto_original)
        valor = extrair_valor(texto_original)
        tipo = extrair_tipo_evento(texto_original)
        
        if not nome_cliente:
            return {"action":"ask","message":f"Para criar o evento, me diga o nome do cliente.{chr(10)}Ex: 'Criar evento para Maria Silva, casamento 15/03, valor 2500'"}
        
        if not data_evento:
            return {"action":"ask","message":f"Qual a data do evento de {nome_cliente}?{chr(10)}Ex: 15/03 ou 15 de março às 14h"}
        
        # Buscar cliente (busca parcial)
        cliente = None
        nome_n = norm(nome_cliente)
        primeiro_nome = nome_n.split()[0] if nome_n.split() else nome_n
        for c in clients:
            cn = norm(c['name'])
            if nome_n in cn or cn in nome_n or primeiro_nome in cn:
                cliente = c
                break
        
        # Se nao achou, criar automaticamente
        if not cliente:
            nc = {"id":str(uuid.uuid4()),"user_id":current_user.id,"name":nome_cliente,
                  "phone":None,"email":None,"notes":"","created_at":dt.now(timezone.utc).isoformat()}
            await db.clients.insert_one(nc)
            cliente = nc
        
        ne = {"id":str(uuid.uuid4()),"user_id":current_user.id,"client_id":cliente["id"],
              "event_type":tipo,"event_date":data_evento,"location":"",
              "total_value":valor,"amount_paid":0.0,"remaining_installments":1,
              "notes":"","status":"confirmado","created_at":dt.now(timezone.utc)}
        await db.events.insert_one(ne)
        
        partes = data_evento[:10].split('-')
        data_fmt = f"{partes[2]}/{partes[1]}/{partes[0]}"
        msg = f"✅ Evento criado com sucesso!{chr(10)}{chr(10)}👤 Cliente: {cliente['name']}{chr(10)}🎯 Tipo: {tipo}{chr(10)}📅 Data: {data_fmt}"
        if valor > 0: msg += f"{chr(10)}💰 Valor: R$ {valor:,.2f}"
        return {"action":"create_event","message":msg}
    
    # AJUDA
    if any(w in t for w in ['ajuda','help','comandos','o que voce faz']):
        return {"action":"answer","message":"🤖 Posso te ajudar com:" + chr(10) + chr(10) + "📋 Clientes:" + chr(10) + "• 'Ver meus clientes'" + chr(10) + "• 'Novo cliente João Silva, tel 11999990000'" + chr(10) + chr(10) + "📅 Eventos:" + chr(10) + "• 'Ver meus eventos'" + chr(10) + "• 'Criar evento para Maria, casamento 15/03, valor 2500'" + chr(10) + "• 'Ensaio para Carlos no dia 20/04 às 14h, valor 800'"}
    
    return {"action":"answer","message":f"Não entendi. Tente:{chr(10)}• 'Criar evento para [nome], [tipo] [data], valor [R$]'{chr(10)}• 'Ver meus clientes'{chr(10)}• 'Novo cliente [nome]'{chr(10)}• 'Ajuda'"}


# ============== INCLUDE ROUTER - DEVE SER DEPOIS DO CORS! ==============
app.include_router(api_router)

# ============== LOGGING ==============
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== RUN SERVER ==============
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
