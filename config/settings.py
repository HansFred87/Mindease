from pathlib import Path
import os
from dotenv import load_dotenv
from decouple import config

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# API Keys for news services
NEWS_API_KEY = config('NEWS_API_KEY', default='')
RSS2JSON_API_KEY = config('RSS2JSON_API_KEY', default='')
GNEWS_API_KEY = config('GNEWS_API_KEY', default='')

# Cache configuration for news data
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 900,  # 15 minutes
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
        }
    }
}

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'admin_news.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'admin_panel.views': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# SECURITY
SECRET_KEY = 'django-insecure-70e!-@u#5sf%tc=x0j5+-f3c(-g#-*$*1l#49(78fej1a)$6o$'
DEBUG = True
ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    ".ngrok-free.app",  # ngrok link ----------------------------------------------------------------------s
]

# Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'admin_panel',  # our custom admin
    'accounts',
    'ai_companion',
    'core',
    'email_notifications',
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',  # ← ADDED
                'django.template.context_processors.static', # ← ADDED
                'admin_panel.context_processors.sidebar_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mindease_db',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# Internationalization
LANGUAGE_CODE = 'en-ph'
TIME_ZONE = 'Asia/Manila'
USE_I18N = True
USE_TZ = True

# Static and Media files
STATIC_URL = 'static/'
STATICFILES_DIRS = [
    BASE_DIR / "accounts" / "static",
    BASE_DIR / "admin_panel" / "static", 
    BASE_DIR / "core" / "static",
]
STATIC_ROOT = BASE_DIR / "staticfiles"  # for production
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

# Allow ngrok subdomains for CSRF checks -----------------------------------------------------------------------------
CSRF_TRUSTED_ORIGINS = [
    "https://*.ngrok-free.app",
    "http://127.0.0.1",
    "http://localhost",
]

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 465
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True
EMAIL_HOST_USER = "charlie.soniac.spencer@gmail.com"
EMAIL_HOST_PASSWORD = "aefvclbwfppxrwap"
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

ASGI_APPLICATION = 'config.asgi.application'

# Optional: use Redis for production (recommended)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}