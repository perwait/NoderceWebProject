/*
 Navicat Premium Data Transfer

 Source Server         : local MySQL
 Source Server Type    : MySQL
 Source Server Version : 50562
 Source Host           : localhost:3306
 Source Schema         : noderce

 Target Server Type    : MySQL
 Target Server Version : 50562
 File Encoding         : 65001

 Date: 08/07/2019 18:01:18
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for posts
-- ----------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts`  (
  `pid` bigint(10) UNSIGNED NOT NULL,
  `pname` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标题',
  `pcentent` varchar(10000) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '内容',
  `plogo` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '图标',
  `ptxt` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '简介',
  `pcreatetime` bigint(14) UNSIGNED NULL DEFAULT NULL COMMENT '创建时间',
  `purl` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '给前端用的url',
  `pecho` int(10) NULL DEFAULT 0 COMMENT '回复数量',
  `pview` int(10) NULL DEFAULT 0 COMMENT '查看次数',
  `plv` int(1) UNSIGNED NULL DEFAULT 0 COMMENT '默认0 ',
  `phidden` int(1) NULL DEFAULT 0 COMMENT '默认0    隐藏1',
  `p_tid` bigint(10) UNSIGNED NOT NULL,
  `p_uid` bigint(10) UNSIGNED NOT NULL,
  `ptop` int(3) UNSIGNED NULL DEFAULT 0 COMMENT '推荐文章排序',
  `ptop_hidden` int(1) UNSIGNED NULL DEFAULT 0 COMMENT '默认0   推送到推荐栏1',
  `prefer` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '参考文献',
  PRIMARY KEY (`pid`, `p_tid`) USING BTREE,
  INDEX `p_for_uid`(`p_uid`) USING BTREE,
  INDEX `pid`(`pid`) USING BTREE,
  INDEX `p_for_tid`(`p_tid`) USING BTREE,
  CONSTRAINT `p_for_tid` FOREIGN KEY (`p_tid`) REFERENCES `theme` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `p_for_uid` FOREIGN KEY (`p_uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for reply
-- ----------------------------
DROP TABLE IF EXISTS `reply`;
CREATE TABLE `reply`  (
  `rid` bigint(10) UNSIGNED NOT NULL,
  `rcontent` varchar(10000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '回复内容',
  `rcreatetime` bigint(14) UNSIGNED NULL DEFAULT NULL COMMENT '回复时间',
  `rhidden` int(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '默认0  隐藏1',
  `r_tid` bigint(10) UNSIGNED NOT NULL,
  `r_pid` bigint(10) UNSIGNED NOT NULL,
  `r_uid` bigint(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`rid`, `r_pid`, `r_tid`) USING BTREE,
  INDEX `r_for_uid`(`r_uid`) USING BTREE,
  INDEX `r_for_tid`(`r_tid`) USING BTREE,
  INDEX `r_for_pid`(`r_pid`) USING BTREE,
  CONSTRAINT `r_for_pid` FOREIGN KEY (`r_pid`) REFERENCES `posts` (`pid`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `r_for_tid` FOREIGN KEY (`r_tid`) REFERENCES `theme` (`tid`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `r_for_uid` FOREIGN KEY (`r_uid`) REFERENCES `user` (`uid`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for theme
-- ----------------------------
DROP TABLE IF EXISTS `theme`;
CREATE TABLE `theme`  (
  `turl` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '给前端用的去主题文章表的url',
  `tid` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tname` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '名称',
  `tlogo` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '/img/icon/theme_default.png' COMMENT '图标',
  `ttext` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '简介',
  `tcreatetime` bigint(14) UNSIGNED NULL DEFAULT NULL,
  `t_uid` bigint(10) UNSIGNED NOT NULL,
  `t_pnum` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '主题内文章数量',
  `ttop` int(3) UNSIGNED NULL DEFAULT 0 COMMENT '默认0 给导航条排序用的',
  `ttop_hidden` int(1) UNSIGNED NULL DEFAULT 0 COMMENT '默认0  显示在导航条1',
  PRIMARY KEY (`tid`) USING BTREE,
  INDEX `t_for_uid`(`t_uid`) USING BTREE,
  CONSTRAINT `t_for_uid` FOREIGN KEY (`t_uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of theme
-- ----------------------------
INSERT INTO `theme` VALUES (NULL, 1, 'HTML', '/img/icon/html.png', NULL, NULL, 1, 0, 0, 0);
INSERT INTO `theme` VALUES (NULL, 2, 'CSS', '/img/icon/css.png', NULL, NULL, 1, 0, 0, 0);
INSERT INTO `theme` VALUES (NULL, 3, 'JavaScript', '/img/icon/javascript.png', NULL, NULL, 1, 7, 2, 1);
INSERT INTO `theme` VALUES (NULL, 4, 'Redis', '/img/icon/redis.png', NULL, NULL, 1, 0, 0, 0);
INSERT INTO `theme` VALUES (NULL, 5, 'Vue', '/img/icon/vue.png', NULL, NULL, 1, 2, 3, 1);
INSERT INTO `theme` VALUES (NULL, 6, 'Node.JS', '/img/icon/node.png', NULL, NULL, 1, 12, 1, 1);
INSERT INTO `theme` VALUES (NULL, 7, 'Nginx', '/img/icon/nginx.png', NULL, NULL, 1, 0, 0, 0);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `uid` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uname` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `upw` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `uurl` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '给前端用的用户主页 url',
  `uphone` int(12) NULL DEFAULT NULL COMMENT '手机号',
  `uqq` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `utxt` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '还没有个性签名' COMMENT '个性签名',
  `uregtime` bigint(14) UNSIGNED NULL DEFAULT NULL COMMENT '注册时间',
  `ulogo` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '/img/user_default.jpg' COMMENT '头像logo',
  `ueamil` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `uartcles` int(5) NULL DEFAULT 0 COMMENT '发布的文章数量',
  PRIMARY KEY (`uid`) USING BTREE,
  INDEX `s_uid`(`uid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', '18503c3a493f7ca0ec9b429c73a0d1b1', NULL, NULL, NULL, '和优秀的人在一起\\r\\n自己也会变得优秀', NULL, '/img/user_admin.png', '', 0);
INSERT INTO `user` VALUES (2, 'root', '18503c3a493f7ca0ec9b429c73a0d1b1', NULL, NULL, NULL, '老板不在家，我就是老大', NULL, '/img/user_default.jpg', NULL, 14);
INSERT INTO `user` VALUES (3, 'noderce', '18503c3a493f7ca0ec9b429c73a0d1b1', NULL, NULL, NULL, '管理员是也', NULL, '/img/user_default.jpg', NULL, 0);

SET FOREIGN_KEY_CHECKS = 1;
