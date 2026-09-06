output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.nexa_server.id
}

output "public_ip" {
  description = "NEXA Elastic IP"
  value       = aws_eip.nexa_eip.public_ip
}

output "public_dns" {
  description = "EC2 public DNS"
  value       = aws_instance.nexa_server.public_dns
}

output "application_url" {
  description = "NEXA application URL"
  value       = "http://${aws_eip.nexa_eip.public_ip}"
}

output "ssh_command" {
  description = "SSH command"
  value       = "ssh -i YOUR_KEY.pem ubuntu@${aws_eip.nexa_eip.public_ip}"
}