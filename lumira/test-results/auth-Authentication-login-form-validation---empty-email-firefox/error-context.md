# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - link "Lumira" [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
        - generic [ref=e14]: Lumira
    - main [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]:
          - link [ref=e19] [cursor=pointer]:
            - /url: /
            - img [ref=e20]
          - heading "欢迎回来" [level=3] [ref=e23]
          - paragraph [ref=e24]: 登录您的账户以继续管理投资组合
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]: 邮箱地址
            - generic [ref=e29]:
              - img [ref=e30]
              - textbox "邮箱地址" [active] [ref=e33]:
                - /placeholder: your@email.com
          - generic [ref=e34]:
            - generic [ref=e35]: 密码
            - generic [ref=e36]:
              - img [ref=e37]
              - textbox "密码" [ref=e40]:
                - /placeholder: 输入您的密码
              - button [ref=e41] [cursor=pointer]:
                - img [ref=e42]
          - button "登录" [ref=e45] [cursor=pointer]
          - generic [ref=e46]:
            - text: 还没有账户？
            - link "立即注册" [ref=e47] [cursor=pointer]:
              - /url: /register
  - alert [ref=e48]
```