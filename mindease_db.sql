-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 15, 2025 at 03:27 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mindease_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_panel_recentactivity`
--

DROP TABLE IF EXISTS `admin_panel_recentactivity`;
CREATE TABLE IF NOT EXISTS `admin_panel_recentactivity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `activity_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `admin_user_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_panel_recentactivity_admin_user_id_b40247d1` (`admin_user_id`),
  KEY `admin_panel_recentactivity_user_id_dbb7f3d6` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_companion_airesponse`
--

DROP TABLE IF EXISTS `ai_companion_airesponse`;
CREATE TABLE IF NOT EXISTS `ai_companion_airesponse` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keywords` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `response` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_companion_conversation`
--

DROP TABLE IF EXISTS `ai_companion_conversation`;
CREATE TABLE IF NOT EXISTS `ai_companion_conversation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `started_at` datetime(6) NOT NULL,
  `last_message_at` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `ai_companion_conversation_user_id_02414b48` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_companion_conversation`
--

INSERT INTO `ai_companion_conversation` (`id`, `session_id`, `started_at`, `last_message_at`, `is_active`, `user_id`) VALUES
(1, 'session_1757171272660_c4oteuhii', '2025-09-12 06:29:51.555533', '2025-09-13 17:30:17.181197', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ai_companion_message`
--

DROP TABLE IF EXISTS `ai_companion_message`;
CREATE TABLE IF NOT EXISTS `ai_companion_message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `conversation_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ai_companion_message_conversation_id_4a2fdf5d` (`conversation_id`)
) ENGINE=MyISAM AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_companion_usermood`
--

DROP TABLE IF EXISTS `ai_companion_usermood`;
CREATE TABLE IF NOT EXISTS `ai_companion_usermood` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mood` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detected_at` datetime(6) NOT NULL,
  `keywords_detected` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ai_companion_usermood_conversation_id_5ca8e5d1` (`conversation_id`),
  KEY `ai_companion_usermood_user_id_37df6380` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE IF NOT EXISTS `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE IF NOT EXISTS `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissions_group_id_b120cbf9` (`group_id`),
  KEY `auth_group_permissions_permission_id_84c5c92e` (`permission_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE IF NOT EXISTS `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  KEY `auth_permission_content_type_id_2f476e4b` (`content_type_id`)
) ENGINE=MyISAM AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add user', 6, 'add_user'),
(22, 'Can change user', 6, 'change_user'),
(23, 'Can delete user', 6, 'delete_user'),
(24, 'Can view user', 6, 'view_user'),
(25, 'Can add ai response', 7, 'add_airesponse'),
(26, 'Can change ai response', 7, 'change_airesponse'),
(27, 'Can delete ai response', 7, 'delete_airesponse'),
(28, 'Can view ai response', 7, 'view_airesponse'),
(29, 'Can add conversation', 8, 'add_conversation'),
(30, 'Can change conversation', 8, 'change_conversation'),
(31, 'Can delete conversation', 8, 'delete_conversation'),
(32, 'Can view conversation', 8, 'view_conversation'),
(33, 'Can add message', 9, 'add_message'),
(34, 'Can change message', 9, 'change_message'),
(35, 'Can delete message', 9, 'delete_message'),
(36, 'Can view message', 9, 'view_message'),
(37, 'Can add user mood', 10, 'add_usermood'),
(38, 'Can change user mood', 10, 'change_usermood'),
(39, 'Can delete user mood', 10, 'delete_usermood'),
(40, 'Can view user mood', 10, 'view_usermood'),
(41, 'Can add Recent Activity', 11, 'add_recentactivity'),
(42, 'Can change Recent Activity', 11, 'change_recentactivity'),
(43, 'Can delete Recent Activity', 11, 'delete_recentactivity'),
(44, 'Can view Recent Activity', 11, 'view_recentactivity');

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
CREATE TABLE IF NOT EXISTS `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6` (`user_id`)
) ;

--
-- Dumping data for table `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(1, '2025-09-12 04:13:31.164463', '2', 'John Doe (counselor)', 3, '', 6, 1),
(2, '2025-09-12 12:08:10.038557', '6', 'John Jacob Cantil (counselor)', 3, '', 6, 1),
(3, '2025-09-12 12:16:37.440234', '7', 'John Jacob Cantil (counselor)', 3, '', 6, 1),
(4, '2025-09-12 12:19:49.032876', '8', 'John Jacob Cantil (counselor)', 3, '', 6, 1),
(5, '2025-09-12 13:19:32.500976', '9', 'John Jacob Cantil (counselor)', 3, '', 6, 1),
(6, '2025-09-15 11:39:08.219700', '19', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(7, '2025-09-15 11:58:10.276306', '20', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(8, '2025-09-15 12:03:53.485456', '21', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(9, '2025-09-15 12:07:07.826257', '22', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(10, '2025-09-15 12:08:17.333728', '23', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(11, '2025-09-15 12:10:16.542022', '24', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(12, '2025-09-15 12:20:44.552699', '25', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(13, '2025-09-15 12:27:05.493189', '26', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(14, '2025-09-15 12:36:37.078864', '27', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(15, '2025-09-15 12:38:39.158732', '28', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(16, '2025-09-15 12:57:07.466188', '29', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(17, '2025-09-15 12:59:58.544541', '30', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(18, '2025-09-15 13:00:36.491378', '31', 'Nigahi Nahoy (admin)', 1, '[{\"added\": {}}]', 6, 1),
(19, '2025-09-15 13:13:16.867200', '32', 'isaiah12345 (user)', 1, '[{\"added\": {}}]', 6, 1),
(20, '2025-09-15 13:13:39.654860', '33', 'Nigahi Nahoy (admin)', 1, '[{\"added\": {}}]', 6, 1),
(21, '2025-09-15 14:02:25.120110', '34', 'Nigahi Nahoy (counselor)', 1, '[{\"added\": {}}]', 6, 1),
(22, '2025-09-15 14:10:37.845289', '35', 'Nigahi Nahoy (counselor)', 1, '[{\"added\": {}}]', 6, 1),
(23, '2025-09-15 14:15:58.465430', '36', 'Nigahi Nahoy (counselor)', 1, '[{\"added\": {}}]', 6, 1),
(24, '2025-09-15 14:57:56.532685', '37', 'Charlie Soniac Spencer (user)', 1, '[{\"added\": {}}]', 6, 1),
(25, '2025-09-15 14:59:18.204576', '38', 'Miyuki Takahashi (counselor)', 1, '[{\"added\": {}}]', 6, 1),
(26, '2025-09-15 15:03:08.967169', '39', 'isaiah12345 (admin)', 1, '[{\"added\": {}}]', 6, 1),
(27, '2025-09-15 15:04:37.055021', '40', 'Nigahi Nahoy (user)', 1, '[{\"added\": {}}]', 6, 1),
(28, '2025-09-15 15:24:50.014127', '41', 'isaiah12345 (counselor)', 1, '[{\"added\": {}}]', 6, 1);

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE IF NOT EXISTS `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(2, 'auth', 'permission'),
(3, 'auth', 'group'),
(4, 'contenttypes', 'contenttype'),
(5, 'sessions', 'session'),
(6, 'accounts', 'user'),
(7, 'ai_companion', 'airesponse'),
(8, 'ai_companion', 'conversation'),
(9, 'ai_companion', 'message'),
(10, 'ai_companion', 'usermood'),
(11, 'admin_panel', 'recentactivity');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE IF NOT EXISTS `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-09-12 04:03:49.265277'),
(2, 'contenttypes', '0002_remove_content_type_name', '2025-09-12 04:03:49.319475'),
(3, 'auth', '0001_initial', '2025-09-12 04:03:49.536315'),
(4, 'auth', '0002_alter_permission_name_max_length', '2025-09-12 04:03:49.567438'),
(5, 'auth', '0003_alter_user_email_max_length', '2025-09-12 04:03:49.576805'),
(6, 'auth', '0004_alter_user_username_opts', '2025-09-12 04:03:49.582759'),
(7, 'auth', '0005_alter_user_last_login_null', '2025-09-12 04:03:49.592030'),
(8, 'auth', '0006_require_contenttypes_0002', '2025-09-12 04:03:49.594306'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2025-09-12 04:03:49.599031'),
(10, 'auth', '0008_alter_user_username_max_length', '2025-09-12 04:03:49.606980'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2025-09-12 04:03:49.613094'),
(12, 'auth', '0010_alter_group_name_max_length', '2025-09-12 04:03:49.644513'),
(13, 'auth', '0011_update_proxy_permissions', '2025-09-12 04:03:49.650046'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2025-09-12 04:03:49.661335'),
(15, 'accounts', '0001_initial', '2025-09-12 04:03:49.900771'),
(16, 'admin', '0001_initial', '2025-09-12 04:03:50.049767'),
(17, 'admin', '0002_logentry_remove_auto_add', '2025-09-12 04:03:50.055860'),
(18, 'admin', '0003_logentry_add_action_flag_choices', '2025-09-12 04:03:50.066630'),
(19, 'ai_companion', '0001_initial', '2025-09-12 04:03:50.303156'),
(20, 'sessions', '0001_initial', '2025-09-12 04:03:50.329722'),
(21, 'admin_panel', '0001_initial', '2025-09-15 14:55:18.178252');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
CREATE TABLE IF NOT EXISTS `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('fllt2wg8d6rro3h3woqi4idp9ovtri8c', '.eJxVjDsOwjAQBe_iGln-7DoOJX3OYK1_OIBsKU4qxN1JpBTQvpl5b-ZoW4vbelrcHNmVSXb53TyFZ6oHiA-q98ZDq-sye34o_KSdTy2m1-10_w4K9bLXXo2gLAmS2kRCIAOgjBmEF0FCNjSgytLqkfSumYyAiAFi0qRtVol9vrnaNwU:1uwyvK:wnTG-UEhZt1lnxfC3CB9vZuz6fovzqFaVwbJYQPSEtU', '2025-09-26 08:14:26.069526'),
('mrgiri7p8hl0mlos9dbmncheue0g78xw', '.eJxVjDsOwjAQBe_iGln-7DoOJX3OYK1_OIBsKU4qxN1JpBTQvpl5b-ZoW4vbelrcHNmVSXb53TyFZ6oHiA-q98ZDq-sye34o_KSdTy2m1-10_w4K9bLXXo2gLAmS2kRCIAOgjBmEF0FCNjSgytLqkfSumYyAiAFi0qRtVol9vrnaNwU:1uy6BL:G2k748vk7LUsTTZbyeG20atadvnxUj3QxpBtlF9J1BY', '2025-09-29 10:11:35.004009');

-- --------------------------------------------------------

--
-- Table structure for table `user_accounts`
--

DROP TABLE IF EXISTS `user_accounts`;
CREATE TABLE IF NOT EXISTS `user_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_relationship` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accepted_privacy_policy` tinyint(1) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `specializations` json DEFAULT NULL,
  `other_specializations` longtext COLLATE utf8mb4_unicode_ci,
  `institution_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution_email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `years_experience` int DEFAULT NULL,
  `bio` longtext COLLATE utf8mb4_unicode_ci,
  `professional_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `degree_certificate` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_accounts`
--

INSERT INTO `user_accounts` (`id`, `password`, `last_login`, `email`, `full_name`, `role`, `age`, `gender`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`, `accepted_privacy_policy`, `is_verified`, `is_active`, `is_staff`, `is_superuser`, `created_at`, `specializations`, `other_specializations`, `institution_name`, `institution_email`, `license_number`, `years_experience`, `bio`, `professional_id`, `degree_certificate`) VALUES
(1, 'pbkdf2_sha256$1000000$lk2ceHIx7vOrfnF7A48MvU$C48IxV7SgBXgp+oHQE2enDCeqoy7lnn9JzfRBP9ibsU=', '2025-09-15 10:11:34.998880', 'marcdaryll.trinidad@gmail.com', 'Marc Daryll Trinidad', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-12 04:04:28.030796', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', ''),
(41, 'pbkdf2_sha256$1000000$lnH8ye2AG38dZ5zB2335Y2$35t0GBe/2J89l5MyWrd86sDHZZ1c5+057wIOYhNIvJw=', NULL, 'miyuki_takahasi2003@gmail.com', 'isaiah12345', 'counselor', NULL, '', NULL, NULL, '', 1, 0, 1, 0, 0, '2025-09-15 15:24:49.993577', '[\"Depression & Mood\", \"Trauma & PTSD\", \"Self-Esteem\"]', 'Jealousy', 'St. Paul University of Surigao', 'example@yahoo.com', 'MT2003', 7, 'hello', 'professional_ids/447674793_122152063940195306_8969402987915957687_n_pjIpKa1.jpg', 'degree_certificates/DevAd.png');

-- --------------------------------------------------------

--
-- Table structure for table `user_accounts_groups`
--

DROP TABLE IF EXISTS `user_accounts_groups`;
CREATE TABLE IF NOT EXISTS `user_accounts_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_accounts_groups_user_id_group_id_3a3ecbf4_uniq` (`user_id`,`group_id`),
  KEY `user_accounts_groups_user_id_99dfbf4d` (`user_id`),
  KEY `user_accounts_groups_group_id_ca633dc4` (`group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_accounts_user_permissions`
--

DROP TABLE IF EXISTS `user_accounts_user_permissions`;
CREATE TABLE IF NOT EXISTS `user_accounts_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_accounts_user_permi_user_id_permission_id_eefa8a82_uniq` (`user_id`,`permission_id`),
  KEY `user_accounts_user_permissions_user_id_67356872` (`user_id`),
  KEY `user_accounts_user_permissions_permission_id_855d22a2` (`permission_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
