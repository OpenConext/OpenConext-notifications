CREATE TABLE notifications
(
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6)   NOT NULL,
    start_at   DATETIME(6)   NOT NULL,
    ends_at    DATETIME(6)   NOT NULL,
    creator    VARCHAR(255)  NOT NULL,
    html_text  VARCHAR(10000) NOT NULL,
    target_app VARCHAR(255)  NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_notifications_target_app_period (target_app, start_at, ends_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
