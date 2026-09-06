resource "aws_instance" "nexa_server" {
  ami           = "ami-01a00762f46d584a1"
  instance_type = var.instance_type

  key_name = var.key_name

  vpc_security_group_ids = [
    aws_security_group.nexa_sg.id
  ]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash

              apt-get update -y

              apt-get install -y git curl

              # Install Docker
              curl -fsSL https://get.docker.com | sh

              # Add ubuntu user to docker group
              usermod -aG docker 
              

              # Install Docker Compose plugin
              apt-get install -y docker-compose-plugin

              # Clone NEXA project
              cd /home/ubuntu

              git clone https://github.com/rahulgowda18/nexa-dashboard.git

              cd nexa-dashboard

              # Start application
              systemctl enable docker
              systemctl start docker

              sleep 20

              docker compose pull
              docker compose up -d
              EOF

  tags = {
    Name = "NEXA-Terraform-Server"
  }
}

resource "aws_eip" "nexa_eip" {

  instance = aws_instance.nexa_server.id
  domain   = "vpc"

  tags = {
    Name    = "nexa-dashboard-eip"
    Project = "NEXA-Dashboard"
  }
}