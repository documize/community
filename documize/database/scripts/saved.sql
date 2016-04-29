use documize;

select * from organization;
select * from user order by id desc;
select * from account order by id desc;
select * from label;
select * from labelrole order by labelid desc;
select * from document order by id desc;
select * from page;
select * from revision order by created desc;
select * from search;
select * from attachment;
select * from audit;
SELECT id, refid, company, title, message, url, domain, email, serial, active, allowanonymousaccess, created, revised FROM organization WHERE domain='demo1' AND active=1;

update label set label = 'Elliotts' where refid='Dm3gA68B';
select * from page where documentid='VsuZPte68QlYquY_' order by sequence;

SELECT UPPER(CONCAT(SUBSTR(firstname, 1, 1), SUBSTR(lastname, 1, 1))) as initials from user;

SELECT a.userid,
COALESCE(u.firstname, '') as firstname,
COALESCE(u.lastname, '') as lastname,
COALESCE(u.email, '') as email,
a.labelid,
b.label as name,
b.type
FROM labelrole a 
LEFT JOIN label b ON b.refid=a.labelid 
LEFT JOIN user u ON u.refid=a.userid 
WHERE a.orgid='4Tec34w8' 
AND b.type!=2 
GROUP BY a.labelid,a.userid
ORDER BY u.firstname,u.lastname;

delete from label where id > 0;

select * from search;


REPAIR TABLE search QUICK;

select * from audit order by id desc;
select refid,firstname,lastname from user where refid in (select userid as refid from audit where documentid='9n_VhcY6');


select max(a.created) as date, a.userid, u.firstname, u.lastname from audit a left join user u ON a.userid=u.refid where a.documentid='M6H0kYov' AND action='get-document'
group by a.userid;

SELECT action, CONVERT_TZ(a.created, @@session.time_zone, '+00:00') as utcdate, a.created, a.userid, u.firstname, u.lastname, a.pageid FROM audit a LEFT JOIN user u ON a.userid=u.refid WHERE documentid='9n_VhcY6' AND 
(action='update-page' OR action='add-page')
ORDER BY created DESC;


SELECT CONVERT_TZ(MAX(a.created), @@session.time_zone, '+00:00') as created, a.userid, u.firstname, u.lastname
		FROM audit a LEFT JOIN user u ON a.userid=u.refid
		WHERE a.orgid='4Tec34w8' AND a.documentid='Zmw6BDCi' AND a.userid != '0' AND action='get-document'
		GROUP BY a.userid ORDER BY a.created DESC;
        
        

SELECT MAX(a.created) as created, a.userid as refid, u.firstname, u.lastname
FROM audit a LEFT JOIN user u ON a.userid=u.refid
WHERE a.documentid='' AND action='get-document'
GROUP BY a.userid;

select * from audit where documentid='kdadSBx1' and (action='update-page' OR action='remove-page' OR action='add-page') order by created desc;

SELECT TIMEDIFF(NOW(), UTC_TIMESTAMP);
SELECT @@global.time_zone;

SELECT * FROM document where tags like "%#hr#%";

select labelid, userid ,count(*) as cnt from labelrole group by labelid,userid;

