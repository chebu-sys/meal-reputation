-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: MealReputation
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `company_id` int NOT NULL AUTO_INCREMENT,
  `login_id` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`company_id`),
  UNIQUE KEY `login_id` (`login_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'TEST1234','$2b$10$TqOMPVxWYN62kJbWgE3oKeEdgh77h1SQueJjCbruLKk9OctyVnifK','SSK','螟ｧ髦ｪ蠎懷､ｧ髦ｪ蟶・,'090-4496-5563','2025-09-06 02:16:05'),(8,'yadokari','$2b$10$e.zeeKHj40Pj8Ed5SUC8juZ2VD.snsPt.m.S0/ccCf.qz5TluCW/C','繝､繝峨き繝ｪ螻九＆繧・,'螟ｧ髦ｪ蠎懊ｄ縺ｩ縺九ｊ蟶・,'06-6666-6666','2026-03-08 12:30:15');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `store_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_store` (`user_id`,`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,'TEST',5,'2026-03-07 05:33:28'),(9,'TEST',16,'2026-03-07 06:36:21'),(11,'TEST',1,'2026-03-07 06:36:38'),(12,'TEST',12,'2026-03-07 06:39:44'),(13,'TEST',13,'2026-03-07 06:40:36');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `menu_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `menu_name` varchar(255) NOT NULL,
  `price` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`menu_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (2,1,'繝ｩ繝ｼ繝｡繝ｳ繝ｻ豎√↑縺・,1000,'2025-09-06 02:22:23'),(3,1,'雎壹Λ繝ｼ繝｡繝ｳ繝ｻ雎壽ｱ√↑縺・,1200,'2025-09-06 02:22:36'),(7,4,'SSK螳夐｣・',1000,'2025-09-06 08:37:42'),(8,4,'SSK螳夐｣・',1000,'2025-09-06 08:37:59'),(9,5,'繝ｩ繝ｼ繝｡繝ｳ',900,'2025-09-06 08:44:45'),(14,1,'雎啗繝ｩ繝ｼ繝｡繝ｳ繝ｻ雎夲ｼｷ豎√↑縺・,1350,'2026-03-07 02:00:37'),(15,12,'鬢・ｭ・,319,'2026-03-07 02:15:41'),(17,20,'繝ｩ繝ｼ繝｡繝ｳ',1580,'2026-04-04 05:27:09');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `rating_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL COMMENT '隧穂ｾ｡縺励◆繝ｦ繝ｼ繧ｶ繝ｼID',
  `store_id` int NOT NULL COMMENT '隧穂ｾ｡縺輔ｌ縺溷ｺ苓・ID',
  `score` int NOT NULL COMMENT '隧穂ｾ｡繧ｹ繧ｳ繧｢ (1-5)',
  `comment` text COMMENT '繝ｦ繝ｼ繧ｶ繝ｼ縺九ｉ縺ｮ繧ｳ繝｡繝ｳ繝・,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '逋ｻ骭ｲ譌･譎・(繧ｳ繝｡繝ｳ繝郁｡ｨ遉ｺ鬆・↓菴ｿ逕ｨ)',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `review_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rating_id`),
  UNIQUE KEY `user_store_unique` (`user_id`,`store_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK (((`score` >= 1) and (`score` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (2,'TEST',4,3,'縺ｦ・難ｽ・,'2025-11-08 04:24:13','2026-01-09 14:34:50',NULL),(6,'TEST3',5,5,'鄒主袖縺吶℃繧具ｼ・ｼ・,'2026-01-08 14:11:29','2026-01-08 14:11:29',NULL),(7,'TEST4',5,5,'縺翫＞縺励＞','2026-01-08 14:11:57','2026-01-08 14:11:57',NULL),(8,'TEST6',5,2,'2譎る俣荳ｦ繧薙□縺九＞縺後≠繧翫∪縺励◆','2026-01-08 14:12:42','2026-01-08 15:11:15',NULL),(9,'TEST5',5,5,'繝九Φ繝九け繝槭す繝､繧ｵ繧､繝槭す繝槭す繧｢繝悶Λ繧ｫ繝ｩ繝｡','2026-01-08 14:14:12','2026-01-10 05:09:47','/uploads/reviews/TEST5-1768021786998-597196896.jpg'),(10,'TEST5',4,4,'縺ｾ縺ゅ∪縺・,'2026-01-08 14:15:44','2026-01-08 14:15:44',NULL),(17,'TEST',16,3,'縺・▲縺ｦ縺ｿ縺溘＞','2026-01-10 07:51:49','2026-03-07 02:03:15',NULL),(18,'TEST',5,5,'鄒主袖縺励°縺｣縺溘〒縺・,'2026-01-10 08:13:42','2026-01-10 08:36:19','/uploads/reviews/TEST-1768034179515-180031717.jpeg'),(19,'TEST',1,5,'縺翫＞縺励＞','2026-03-07 02:06:22','2026-03-07 02:06:22',NULL),(20,'TEST',12,3,'鬢・ｭ舌→縺・∴縺ｰ縺薙％','2026-03-07 02:16:38','2026-03-07 02:22:29','/uploads/reviews/TEST-1772850149300-151341939.jpg'),(21,'testtest',20,5,'aaaa','2026-03-08 14:03:59','2026-03-08 14:03:59','/uploads/reviews/testtest-1772978639405-28996233.JPG'),(22,'shiro',20,5,'test','2026-04-03 12:42:48','2026-04-03 12:42:48','/uploads/reviews/shiro-1775220168493-787816562.JPG'),(23,'shiro',12,5,'<script>alert(\'XSS\')</script>','2026-04-04 04:57:23','2026-04-04 05:03:35',NULL);
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_likes`
--

DROP TABLE IF EXISTS `review_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_likes` (
  `liker_id` varchar(255) NOT NULL COMMENT '縺・＞縺ｭ繧偵＠縺溘Θ繝ｼ繧ｶ繝ｼ縺ｮID (users.id縺ｨ騾｣謳ｺ)',
  `rating_id` int NOT NULL COMMENT '縺・＞縺ｭ縺ｮ蟇ｾ雎｡縺ｨ縺ｪ縺｣縺溷哨繧ｳ繝溘・ID (ratings.rating_id縺ｨ騾｣謳ｺ)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '縺・＞縺ｭ縺励◆譌･譎・,
  PRIMARY KEY (`liker_id`,`rating_id`),
  KEY `rating_id` (`rating_id`),
  CONSTRAINT `review_likes_ibfk_1` FOREIGN KEY (`liker_id`) REFERENCES `users` (`id`),
  CONSTRAINT `review_likes_ibfk_2` FOREIGN KEY (`rating_id`) REFERENCES `ratings` (`rating_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_likes`
--

LOCK TABLES `review_likes` WRITE;
/*!40000 ALTER TABLE `review_likes` DISABLE KEYS */;
INSERT INTO `review_likes` VALUES ('shiro',20,'2026-04-04 13:57:39'),('TEST',6,'2026-01-08 23:16:58'),('TEST',7,'2026-01-10 17:13:55'),('TEST',8,'2026-01-08 23:17:03'),('TEST',9,'2026-01-08 23:17:06'),('TEST',10,'2026-01-10 14:13:19'),('TEST5',2,'2026-01-08 23:15:47'),('TEST5',6,'2026-01-08 23:14:19'),('TEST5',7,'2026-01-08 23:14:18'),('TEST5',8,'2026-01-08 23:14:23'),('TEST5',9,'2026-01-08 23:14:22'),('TEST5',10,'2026-01-08 23:15:46');
/*!40000 ALTER TABLE `review_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `description` text,
  `genre` varchar(50) DEFAULT NULL,
  `image_width` int DEFAULT NULL,
  `image_height` int DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,1,'繝ｩ繝ｼ繝｡繝ｳ闕・豁ｴ蜿ｲ繧貞綾繧・荳区眠蠎・悽蠎・,'','06-6195-5910','/images/image-1775278369278-17833353.JPG','','縺昴・莉悶Ξ繧ｹ繝医Λ繝ｳ',4032,3024),(4,1,'繝ｩ繝ｼ繝｡繝ｳ豎逕ｰ螻・蜷ｹ逕ｰ蠎・,'螟ｧ髦ｪ蠎懷聖逕ｰ蟶ょｯｿ逕ｺ1-3-3','-','/images/image-1775278436413-821502982.JPG','','縺昴・莉悶Ξ繧ｹ繝医Λ繝ｳ',4032,3024),(5,1,'繝ｩ繝ｼ繝｡繝ｳ莠碁ヮ 逾樒伐逾樔ｿ晉伴蠎・,' 譚ｱ莠ｬ驛ｽ蜊・ｻ｣逕ｰ蛹ｺ逾樒伐逾樔ｿ晉伴・台ｸ∫岼・抵ｼ鯛・・・,'荳肴・','/images/image-1775278493941-44291123.jpg','莠碁ヮ邉ｻ繝ｩ繝ｼ繝｡繝ｳ','縺昴・莉悶Ξ繧ｹ繝医Λ繝ｳ',3024,4032),(12,1,'鬢・ｭ舌・邇句ｰ・豺｡霍ｯ隘ｿ蜿｣蠎・,'螟ｧ髦ｪ蠎懷､ｧ髦ｪ蟶よ擲豺蟾晏玄豺｡霍ｯ・比ｸ∫岼・披・・・,'06-6324-0418','/images/image-1775278563559-955556533.JPG','','荳ｭ闖ｯ譁咏炊',4032,3024),(13,1,'繝ｩ繧､繧ｪ繝ｳ繧ｫ繝ｬ繝ｼ豺｡霍ｯ蠎・,' 螟ｧ髦ｪ蠎懷､ｧ髦ｪ蟶よ擲豺蟾晏玄豺｡霍ｯ4-11-17','','/images/image-1772850306568-830995276.jpg','','豢矩｣・,289,312),(14,1,'繝槭け繝峨リ繝ｫ繝・髦ｪ諤･豺｡霍ｯ蠎・,'螟ｧ髦ｪ蠎懷､ｧ髦ｪ蟶よ擲豺蟾晏玄豺｡霍ｯ4-9-18','06-6321-1080','/images/image-1772850491342-665404847.webp','','縺昴・莉悶Ξ繧ｹ繝医Λ繝ｳ',2611,1958),(15,1,'縺・←繧灘・ 譚ｾ','螟ｧ髦ｪ蟶よ擲豺蟾晏玄譚ｱ豺｡霍ｯ4-17-8',' 06-6322-0831','/images/image-1772856226278-986624182.jpg','','縺昴・莉悶Ξ繧ｹ繝医Λ繝ｳ',1000,667),(16,1,'繝ｩ繝ｼ繝｡繝ｳ莠碁ヮ縲莠ｬ驛ｽ蠎・,'莠ｬ驛ｽ蠎應ｺｬ驛ｽ蟶ょｷｦ莠ｬ蛹ｺ荳荵怜ｯｺ驥後ヮ蜑咲伴・・,'荳肴・','/images/image-1768029742747-1503697.jpg','','縺昴・莉悶Ξ繧ｹ繝医Λ繝ｳ',2000,1114),(17,1,'豬ｷ魄ｮ螻句床縺翫￥縺ｾ繧・豺｡霍ｯ蠎・,'螟ｧ髦ｪ蠎懷､ｧ髦ｪ蟶よ擲豺蟾晏玄譚ｱ豺｡霍ｯ4-33-39','06-6195-6007','/images/image-1772856379993-249363591.jpg','','蜥碁｣・,365,234),(18,1,'螟ｩ荳ｼ蟆る摩蠎・謾ｿ螳・,'螟ｧ髦ｪ蠎懷､ｧ髦ｪ蟶よ擲豺蟾晏玄豺｡霍ｯ4-11-8','-','/images/image-1772856528790-835096251.jpg','','荳ｭ闖ｯ譁咏炊',640,480),(19,1,'縺・∪縺・ｂ繧灘・ 縺・＠縺九ｏ','螟ｧ髦ｪ蠎懷､ｧ髦ｪ蟶よ擲豺蟾晏玄豺｡霍ｯ・比ｸ∫岼・托ｼ披・・托ｼ・1F','06-6476-7627','/images/image-1772857128482-285063223.webp','','縺昴・莉悶Ξ繧ｹ繝医Λ繝ｳ',1280,960),(20,8,'繝√ぉ繝・,'繝・せ繝・,'050-5555-5555','/images/image-1775284468516-438984014.JPG','test','',4284,5712),(23,8,'繝√ぉ繝悶Λ繝ｼ繧ｷ繧ｫ','繝√ぉ繝悶Λ繝ｼ繧ｷ繧ｫ','繝√ぉ繝悶Λ繝ｼ繧ｷ繧ｫ','/images/image-1775284589924-323074755.JPG','繝√ぉ繝悶Λ繝ｼ繧ｷ繧ｫ','蜥碁｣・,4032,3024);
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userinfo`
--

DROP TABLE IF EXISTS `userinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userinfo` (
  `user_id` varchar(50) NOT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `gender` int DEFAULT NULL,
  `bio` text,
  `region` varchar(50) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `favorite_food` text,
  `last_login_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `userinfo_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userinfo`
--

LOCK TABLES `userinfo` WRITE;
/*!40000 ALTER TABLE `userinfo` DISABLE KEYS */;
INSERT INTO `userinfo` VALUES ('gazoutest',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-09 22:03:35'),('shiro','繝√ぉ繝・,1,'縺・＜繝ｼ縺・,'蛹玲ｵｷ驕・,'/uploads/shiro.JPG','[\"蜥碁｣歃"]','2026-04-04 16:14:01'),('TEST','繝・せ繝医Θ繝ｼ繧ｶ繝ｼ',1,'繝・せ繝医さ繝｡繝ｳ繝・,'螟ｧ髦ｪ蠎・,'/uploads/TEST.png','[\"蜥碁｣歃",\"荳ｭ闖ｯ譁咏炊\"]','2026-03-07 16:09:48'),('TEST5',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-10 14:07:54'),('testtest','繝√ぉ繝・,1,'qq','蛹玲ｵｷ驕・,'/uploads/testtest.JPG','[\"蜥碁｣歃"]','2026-03-08 23:02:34');
/*!40000 ALTER TABLE `userinfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('gazoutest','$2b$10$XBDDWbcszGDtXPc2jaB8NOEAC8gcm37u6yQTHnCyfEp7/ydU4nrby'),('shiro','$2b$10$mP393xgjEbBmXCMTyxDIiO0ZOXaJ5UQX.cGb3DC8mJ80PWQcdaeNu'),('shiroaa','$2b$10$erUtVrHLggRep5FmtrpGeO6MuCb57Qqv/ZnDFylMntoeGaUKT80jC'),('TEST','$2b$10$NTdWYCwkg289NMys6HZPZu.MMZ.9hG5AnrDYM2RDS22VPPyYVUvPS'),('TEST2','$2b$10$h90QrowsQIaDU/S6GwR0EOt9KTWDvPmve49m1h5P52/POvRaJOX.2'),('TEST3','$2b$10$WyaLvNuJqfKCFZ8HXrEzmOK02Mcw3/q6SJK/qF01GNQVBX2ZxSryi'),('TEST4','$2b$10$HD1CMmjwDvE3GMlm2ntrl.fqyxnOayZhX8N13ElUVX4kZYMXbdNwi'),('TEST5','$2b$10$Y7/ItkFY8IW8DUP4r1i/jeAjdWSv5q2oWhSiKEeR1aLAht9AmTml6'),('TEST6','$2b$10$.4s1kqAelLSP/ck0ofsmROU2bXabP/tq/0mDHyeKQkyYdgK9oNkz6'),('TESTmiruyou','$2b$10$qycrNo2q1L4P8W915NVu6eFw6zS4nuGYAS2qW.66ftaM5Z.OPmIRu'),('testtest','$2b$10$wB7DV4APOVCPUmiuJF/lQ.1fCMxhs6h8sBJ8/XQ.YOvX8tKOXTE.2'),('TESTUSER','$2b$10$X8WLgAqaZs5oDHnDI9W.kun82qpN4gfo4M0vdFMhXR5NwmHfU6Ow.');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-08 15:20:04
